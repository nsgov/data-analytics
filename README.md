data-analytics.js
=================

data-analytics.js aims to simplify analytics tagging within a page, by
providing a means of specifying analytics data in purely declarative
`data-analytics` attributes, instead of requiring click handlers to be
written.
This also provides a level of abstraction, allowing data-analytics to
work on pages using either the ga.js or analytics.js code.


Usage
-----

`data-analytics` attributes may contain one or more key=value fields, separated by semi-colons;

	<!-- eg: -->
	<a href="something" data-analytics="category=Things;action=Clicked;label=Something">

data-analytics.js recognizes the the fields `category`, `action`, `label`, and `value` for event tracking,
and `domains` for cross-domain visits.

Fields can be grouped in a single tag, or spread out in the DOM tree.
This way instead of repeating some of the same fields over and over,
fields can be inherited from ancestor elements in the DOM.
A field can also be repeated in the DOM heirarchy, with the deeper element overriding the ancestor value.

	<!-- eg: -->
	<body data-analytics="category=Department of Funny Things">
		⋮ 
		<ul data-analytics="action=Viewed Photo">
			<li><a href="cat.gif" data-analytics="label=Cat"><img src="cat-thumb.jpg" alt="Cat"></a></li>
			<li><a href="dog.jpg" data-analytics="label=Dog"><img src="dog-thumb.jpg" alt="Dog"></a></li>
			<li><a href="catsanddogs.pdf" data-analytics="action=Downloaded;label=catsanddogs.pdf">...</a></li>

For event tracking, when a link is clicked data-analytics.js submits the event data to be recorded if
at least `category`, `action`, and `label` are defined (or inherited) for that link.


Cross Domain Linking
--------------------

For sharing analytics over muliple distinct domain names, give the
body tag on both sites a data-analytics attribute with a `domains` field.
This field is a space-separated list of those shared domains.
To also include subdomains, prefix the domain name with a dot.
Subdomains are automatically always included if using Universal
Analytics (analytics.js).

	<!-- eg: -->
	<body data-analytics="domains=.novascotia.ca .gov.ns.ca">

If using cross domain functionality, the Google Analytics
initialization code on the sites will need to set the
`allowLinker` parameter to true.
See the
[analytics.js](https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain)
or
[ga.js](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiDomainDirectory#_gat.GA_Tracker_._setAllowLinker)
documentation for specifics about setting allowLinker.
