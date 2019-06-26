module.exports = ({ theme, frontMessage, frontImage, insideMessage, insideImage }) => {
  const today = new Date();
  return `<!doctype html>
<html>
   <head>
      <meta charset="utf-8">
      <title>${theme.toUpperCase()} PDF</title>
      <style>
        @import url('https://fonts.googleapis.com/css?family=Great+Vibes&display=swap');
        * {
          box-sizing: border-box;
        }
        body {
          text-align: center;
          line-height: 1.5; 
          margin: 0;
          padding: 0;
        }
        .pg {
         max-width: 504px;
         font-family: 'Great Vibes', cursive;
         height: 704px;
         padding: 30px;
         margin: 20px auto;
         border: 2px dashed black;
        }
        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }
        nav,
        footer {
          padding: 1% 0;
          background-color: #aaa;
        }
        footer {
          margin-top: 20px;
        }
        h2 {
          margin-top: 40px;
        }
        h3 {
          text-align: center;
        }
        p {
          text-align: center; 
        }
      </style>
   </head>
   <body>
   <p>Created ${`${today.getDate()}. ${today.getMonth() +
     1}. ${today.getFullYear()}.`} with www.just-the-occasion.com</p>
     <section class="content">
     <div class="pg pg-outside">
     <h2>${frontMessage}</h2>
     <img src="${frontImage}" alt="front card image"/>
     </div> 
     <div class="pg pg-inside">
     <p>${insideMessage}</p>
     <img src="${insideImage}" alt="card image interior"/>
     </div>
     </section>
     <p>Created ${`${today.getDate()}. ${today.getMonth() +
       1}. ${today.getFullYear()}.`} with www.just-the-occasion.com</p>
   </body>
</html> `;
};
