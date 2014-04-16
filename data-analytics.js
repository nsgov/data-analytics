/* data-analytics.js	*	@author David Nordlund	*	© Province of Nova Scotia */
/* Simplify _trackEvent & _link for Google Analytics with unobtrusive javascript.
 * Usage: set data-analytics attributes on html tags.
 * These attributes may contain one or more fields, separated by semi-colons;
 * eg: data-analytics="action=Clicked something;value=8"
 * Fields can be grouped in a single tag, or spread out in the DOM tree.
 * When an element is clicked and enough data-analytics fields are present
 * in that tag or its ancestors, _trackEvent and/or _link will invoked.
 * Fields for _trackEvent are: category, action, label, and value.
 * For sharing analytics over muliple top-level domain names,
 * the domains field is a space-separated list of those shared domains,
 * and matching links will be linked using GA's _link function.
 * To also include subdomains, prefix the domain name with a dot.
 * eg: <body data-analytics="domains=.novascotia.ca .gov.ns.ca">
 */
(function() {

/* Check clicked elements (& ancestors) for fields in data-analytics attributes.
 * If all the fields required for a trackEvent are found (category,action,label),
 * then track the event.
 * If the element is a link to a shared domain (domains field), _link it via _gaq.
 */
function clicked(e) {
	var fields = {}, keycut = /^\s*(\w+)\s*=\s*(.*)\s*$/, a=0,
	    actiontags = {'A':1, 'AREA':1, 'BUTTON':1, 'INPUT':1};
	// collect values from data-analytics attributes into fields
	for (var t = e.target||e.srcElement, attr; t; t = t.parentNode)
		if (t.nodeType==1) {
			!a && (t.tagName in actiontags) && (a=t); // keep track of the actionable tag for later
			if ((attr = t.getAttribute("data-analytics")))
				for (var d = attr.split(';'), i = d.length, v; i--;)
					(v=keycut.exec(d[i])) && !(v[1] in fields) && (fields[v[1]]=v[2]);
		}
	if (a) {
		if (fields.category && fields.action && fields.label) {
			// enough data to record event
			var te = ['_trackEvent', fields.category, fields.action, fields.label];
			("value" in fields) && te.push(fields.value-0);
			_gaq.push(te);
		}
		// handle external links to shared analytics domains
		if (a && a.href && fields.domains && !a.onclick) {
			for (var sd = fields.domains.split(/ +/), i = sd.length; i--;) {
				var r = RegExp('^'+sd[i].replace(/[^-\w]+/g, "\\.").replace(/^\\\./, "(.+\\.)?")+'$', 'i');
				if (r.test(a.hostname) && !r.test(location.hostname)) {
					// shared external domain
					if (e.preventDefault) e.preventDefault();
					else if (window.event) window.event.returnValue = false;
					_gaq.push(['_link', a.href]);
					break;
				}
			}
		}
	}
}
if (window._gaq) { // don't do anything if _gaq isn't even in the page
	if (document.addEventListener)
		document.addEventListener("click", clicked, false);
	else if (document.attachEvent)
		document.attachEvent("onclick", clicked);
}
})();
