# Shrink Me (TinyApp Project)

ShrinkMe is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of Homepage"](https://github.com/nridout/tinyapp-project/blob/5c1052fb3b2a0d90f946e99724fc28cd5ecec9cc/docs/home-page.png?raw=true)
!["Screenshot of My Links Index"](https://github.com/nridout/tinyapp-project/blob/5c1052fb3b2a0d90f946e99724fc28cd5ecec9cc/docs/my-links-index.png?raw=true)
!["Screenshot of My Links Edit"](https://github.com/nridout/tinyapp-project/blob/5c1052fb3b2a0d90f946e99724fc28cd5ecec9cc/docs/my-links-edit.png?raw=true)
!["Screenshot of Shrink New Link"](https://github.com/nridout/tinyapp-project/blob/5c1052fb3b2a0d90f946e99724fc28cd5ecec9cc/docs/shrink-new-link.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Extras

- Created a custom homepage that
  * features Login & Register buttons when not logged in
  * redirects to the user's URL Index (/urls) when logged in
- Added a responsive Navigation Bar (in _header)
- Added hover class to the table so the links are highlighted as the user
  browses the table
- Links to external urls open in a new window