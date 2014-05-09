/* data-analytics.js  *  @author David Nordlund  *  © Province of Nova Scotia */
/* Simplify event tracking and cross domain visits for Google Analytics
 * with unobtrusive javascript.
 * Usage: set data-analytics attributes on html tags.
 * These attributes may contain one or more fields, separated by semi-colons;
 * eg: data-analytics="action=Clicked something;value=8"
 * Fields can be grouped in a single tag, or spread out in the DOM tree.
 * Fields for events are: category, action, label, and value.
 * eg: <ul data-analytics="category=Special Links;action=Clicked">
 *      <li><a href="cat.gif" data-analytics="label=Cat photo"><img...></a></li>
 *      <li><a href="dog.jpg" data-analytics="label=Dog photo"><img...></a></li>
 *      <li><a href="catsanddogs.pdf" data-analytics="action=Downloaded;label=catsanddogs.pdf">...</a></li>
 * For sharing analytics over muliple distinct domain names,
 * the domains field is a space-separated list of those shared domains.
 * To also include subdomains, prefix the domain name with a dot.
 * eg: <body data-analytics="domains=.novascotia.ca .gov.ns.ca">
 */
(function(data_analytics) {
	function clicked(e) {
		var tag = e.target||e.srcElement;  (tag.nodeType==1)||(tag = tag.parentNode);
		var dav = data_analytics.values(tag);
		var a, actiontags = {A:1, AREA:1, BUTTON:1}, i, imp;
		for (a = tag; a && !(a.tagName in actiontags); a = a.parentNode); //a = ancestor action tag
		if (a) for (i in data_analytics.implementations) {
			imp = data_analytics.implementations[i];
			(i in window) && imp.clicked && imp.clicked(e, dav, a);
		}
	}
	for (var i in data_analytics.implementations) {
		var imp = data_analytics.implementations[i];
		(imp in window) && imp.init && imp.init(data_analytics);
	}
	if (document.addEventListener)
		document.addEventListener("click", clicked, false);
	else if (document.attachEvent)
		document.attachEvent("onclick", clicked);
})({
	/** Collect values in data-analytics attributes from a DOM element and its ancestors.
	 * @param   tag   The DOM element to collect the data-analytics for.
	 * @return  an object of key:value pairs.
	 */
	values: function(tag) {
		var values={}, attr, t, kv, keycut = /^\s*(\w+)\s*=\s*(.*)\s*$/;
		for (t=tag; t && (t.nodeType==1); t = t.parentNode) // start with tag, then go through ancestors
			if ((attr = t.getAttribute("data-analytics"))) // for each "k=v", set values[k]=v
				for (var fields = attr.split(';'), i = fields.length; i--;) 
					(kv=keycut.exec(fields[i])) && !(kv[1] in values) && (values[kv[1]]=kv[2]);
		return values;
	},

	implementations: {
		ga: { // Universal Analytics
			init: function(data_analytics) {
				var dav = document.body ? data_analytics.values(document.body) : {};
				if (dav.domains) {
					var domains = dav.domains.replace(/(^|\s)\./g, ' ').replace(/(^\s+|s+$)/g, '');
					ga('require', 'linker');
					ga('linker:autoLink', domains.split(/\s+/));
				}
			},
			clicked: function(e, dav, a) {
				var keymap = {
					eventCategory:'category', eventAction:'action', eventLabel:'label', eventValue:'value'
				};
				if (dav.category && dav.action && dav.label) {
					var ga_key, da_key, event = {};
					for (ga_key in keymap)
						if ((da_key = keymap[ga_key]) && (da_key in dav))
							event[ga_key] = dav[da_key];
					ga('send', 'event', event);
				}
			}
		},
		_gaq: { // old _gaq analytics
			clicked: function(e, dav, a) {
				if (dav.category && dav.action && dav.label) {
					var te = ['_trackEvent', dav.category, dav.action, dav.label];
					('value' in dav) && te.push(dav.value-0);
					_gaq.push(te);
				}
				if (dav.domains && a.href && a.hostname) {
					var shared = dav.domains.split(/\s+/);
					if (this.isSharedExternalDomain(a.hostname, shared)) {
						if (e.preventDefault) e.preventDefault();
						else if (window.event) window.event.returnValue = false;
						_gaq.push(['_link', a.href]);
					}
				}
			},
			isSharedExternalDomain: function(hostname, shared_domain_list) {
				for (var i = shared_domain_list.length; i--;) {
					var d = shared_domain_list[i];
					var r = RegExp('^'+d.replace(/\./g, "\\.").replace(/^\\\./, "(.+\\.)?")+'$', 'i');
					if (d && r.test(hostname) && !r.test(location.hostname))
						return true;
				}
				return false;
			}
		}
	}
});
