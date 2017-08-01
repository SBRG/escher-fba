import {
  glp_create_prob, glp_set_prob_name, glp_set_obj_dir, glp_add_rows, 
  glp_add_cols, glp_set_row_name, glp_set_row_bnds, glp_set_col_name, 
  glp_set_col_bnds, glp_set_obj_coef, glp_load_matrix, glp_simplex, 
  glp_get_obj_val, glp_get_num_cols, glp_get_col_name, glp_get_col_prim, 
  SMCP, GLP_MAX, GLP_FX, GLP_DB, GLP_ON
} from 'glpk.js';

export class Model {
  constructor (data) {
    this.reactions = data.reactions
    this.metabolites = data.metabolites
    this.genes = data.genes
    this.id = data.id
    this.notes = data.notes
    this.description = data.description
  }

  build_glpk_problem () {
    /** Build a GLPK LP for the model */

    const n_rows = this.metabolites.length
    const n_cols = this.reactions.length
    const ia = []
    const ja = []
    const ar = []
    const met_lookup = {}

    // initialize LP objective
    var lp = glp_create_prob();
    glp_set_prob_name(lp, 'knockout FBA');
    // maximize
    glp_set_obj_dir(lp, GLP_MAX);
    // set up rows and columns
    glp_add_rows(lp, n_rows);
    glp_add_cols(lp, n_cols);

    // metabolites
    this.metabolites.forEach(function (metabolite, i) {
      var row_ind = i + 1;
      glp_set_row_name(lp, row_ind, metabolite.id);
      glp_set_row_bnds(lp, row_ind, GLP_FX, 0.0, 0.0);
      // remember the indices of the metabolites
      met_lookup[metabolite.id] = row_ind;
    });

    // reactions
    var mat_ind = 1;
    this.reactions.forEach(function (reaction, i) {
      var col_ind = i + 1;

      glp_set_col_name(lp, col_ind, reaction.id);
      if (reaction.lower_bound === reaction.upper_bound)
        glp_set_col_bnds(lp, col_ind, GLP_FX, reaction.lower_bound, reaction.upper_bound);
      else
        glp_set_col_bnds(lp, col_ind, GLP_DB, reaction.lower_bound, reaction.upper_bound);
      glp_set_obj_coef(lp, col_ind, reaction.objective_coefficient);

      // S matrix values
      for (var met_id in reaction.metabolites) {
        ia[mat_ind] = met_lookup[met_id];
        ja[mat_ind] = col_ind;
        ar[mat_ind] = reaction.metabolites[met_id];
        mat_ind++;
      }
    });
    // Load the S matrix
    glp_load_matrix(lp, ia.length - 1, ia, ja, ar);

    return lp
  }

  optimize() {
    const problem = this.build_glpk_problem()
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
    constructor(objectiveValue, fluxes) {
        this.objectiveValue = objectiveValue
        this.fluxes = fluxes
    }
} 