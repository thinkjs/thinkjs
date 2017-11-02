<% if (babel) {
  %><% include development.raw.js %><% 
} else {
  %><% include development.babel.js %><%
} %>