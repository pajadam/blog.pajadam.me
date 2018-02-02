var disqus_config = function () {
  var data_element = document.getElementById("disqus-data")
  this.page.url = data_element.dataset.url;
  this.page.identifier = data_element.dataset.identifier;
};

(function() {
  var d = document, s = d.createElement('script');
  s.src = 'https://blog-pajadam-me.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
})();