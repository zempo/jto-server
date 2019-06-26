module.exports = ({ theme, frontMessage, frontImage, insideMessage, insideImage }) => {
  const today = new Date();
  return `<!doctype html>
<html>
   <head>
      <meta charset="utf-8">
      <title>${theme.toUpperCase()} Card</title>
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
         max-width: 557px;
         font-family: 'Great Vibes', cursive;
         height: 797px;
         padding: 30px;
         border: 2px dashed black;
        }
        .pg-front {
          margin: 100px auto;
        }
        .spacer {
          text-align: center;
          margin: 0 auto;
          border: 1px solid black;
        }
        .pg-inside {
          margin: 100px auto 0;
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
        #front-img {
          height: 500px;
          width: 400px;
        }
        #inside-img {
          margin-top: 50px;
          height: 350px;
          width: 350px;
        }
      </style>
   </head>
   <body>
   <div class="spacer">1. Print --> 2. Cut --> 3. Paste</div>
     <section class="content">
     <div class="pg pg-front">
     <h2>${frontMessage}</h2>
     <img src="${frontImage}" alt="front card image" id="front-img" />
     </div> 
     <div class="spacer">1. Print --> 2. Cut --> 3. Paste</div>
     <div class="pg pg-inside">
     <p>${insideMessage}</p>
     <img src="${insideImage}" alt="card image interior" id="inside-img" />
     </div>
     </section>
   </body>
</html>`;
};
