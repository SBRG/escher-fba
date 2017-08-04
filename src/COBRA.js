import {
  glp_create_prob, glp_set_prob_name, glp_set_obj_dir, glp_add_rows,
  glp_add_cols, glp_set_row_name, glp_set_row_bnds, glp_set_col_name,
  glp_set_col_bnds, glp_set_obj_coef, glp_load_matrix, glp_simplex,
  glp_get_obj_val, glp_get_num_cols, glp_get_col_name, glp_get_col_prim,
  SMCP, GLP_MAX, GLP_FX, GLP_DB, GLP_ON
} from 'glpk.js'

export class Model {
  constructor (data) {
    this.reactions = data.reactions.map(x => ({...x}))
    this.metabolites = data.metabolites.map(x => ({...x}))
    this.genes = data.genes.map(x => ({...x}))
    this.id = data.id
    this.notes = data.notes // TODO is this an object? if so clone
    this.description = data.description
  }

  buildGlpkProblem () {
    /** Build a GLPK LP for the model */

    const nRows = this.metabolites.length
    const nCols = this.reactions.length
    const ia = []
    const ja = []
    const ar = []
    const metLookup = {}

    // initialize LP objective
    var lp = glp_create_prob()
    glp_set_prob_name(lp, 'knockout FBA')
    // maximize
    glp_set_obj_dir(lp, GLP_MAX)
    // set up rows and columns
    glp_add_rows(lp, nRows)
    glp_add_cols(lp, nCols)

    // metabolites
    this.metabolites.forEach(function (metabolite, i) {
      var rowInd = i + 1
      glp_set_row_name(lp, rowInd, metabolite.id)
      glp_set_row_bnds(lp, rowInd, GLP_FX, 0.0, 0.0)
      // remember the indices of the metabolites
      metLookup[metabolite.id] = rowInd
    })

    // reactions
    var matInd = 1
    this.reactions.forEach(function (reaction, i) {
      var colInd = i + 1

      glp_set_col_name(lp, colInd, reaction.id)
      if (reaction.lower_bound === reaction.upper_bound) {
        glp_set_col_bnds(lp, colInd, GLP_FX, reaction.lower_bound, reaction.upper_bound)
      } else {
        glp_set_col_bnds(lp, colInd, GLP_DB, reaction.lower_bound, reaction.upper_bound)
      }
      glp_set_obj_coef(lp, colInd, reaction.objective_coefficient)

      // S matrix values
      for (var met_id in reaction.metabolites) {
        ia[matInd] = metLookup[met_id]
        ja[matInd] = colInd
        ar[matInd] = reaction.metabolites[met_id]
        matInd++
      }
    })
    // Load the S matrix
    glp_load_matrix(lp, ia.length - 1, ia, ja, ar)

    return lp
  }

  optimize () {
    const problem = this.buildGlpkProblem()
    var smcp = new SMCP({ presolve: GLP_ON })
    glp_simplex(problem, smcp)
    // get the objective
    var f = glp_get_obj_val(problem)
    // get the primal
    var x = {}
    for (var i = 1; i <= glp_get_num_cols(problem); i++) {
      x[glp_get_col_name(problem, i)] = glp_get_col_prim(problem, i)
    }
    return new Solution(f, x)
  }
}

export class Solution {
  constructor (objectiveValue, fluxes) {
    this.objectiveValue = objectiveValue
    this.fluxes = fluxes
  }
}
