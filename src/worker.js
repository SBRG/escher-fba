console.log('script run')
this.onmessage = (model) => {
  this.postMessage(model)
  console.log(model)
}
