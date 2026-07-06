<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta name="robots" content="noindex" />
  <meta name="origin" content="defaultBackend" />
  <title>401 Error!</title>
  <link rel="shortcut icon" href="../imgs/favicon/favicon.ico" />
</head>
<style>
  @import url('https://fonts.googleapis.com/css?family=Montserrat:400,600,700');
  @import url('https://fonts.googleapis.com/css?family=Catamaran:400,800');

  .error-container {
    text-align: center;
    font-size: 180px;
    font-family: 'Catamaran', sans-serif;
    font-weight: 800;
    margin: 20px 15px;
  }

  .error-container>span {
    display: inline-block;
    line-height: 0.7;
    position: relative;
    color: #FFB485;
  }

  .error-container>span>span {
    display: inline-block;
    position: relative;
  }

  .error-container>span:nth-of-type(1) {
    perspective: 1000px;
    perspective-origin: 500% 50%;
    color: #F0E395;
  }

  .error-container>span:nth-of-type(1)>span {
    transform-origin: 50% 100% 0px;
    transform: rotateX(0);
    animation: easyoutelastic 8s infinite;
  }

  .error-container>span:nth-of-type(3) {
    perspective: none;
    perspective-origin: 50% 50%;
    color: #D15C95;
  }

  .error-container>span:nth-of-type(3)>span {
    transform-origin: 100% 100% 0px;
    transform: rotate(0deg);
    animation: rotatedrop 8s infinite;
  }

  @keyframes easyoutelastic {
    0% {
      transform: rotateX(0);
    }

    9% {
      transform: rotateX(210deg);
    }

    13% {
      transform: rotateX(150deg);
    }

    16% {
      transform: rotateX(200deg);
    }

    18% {
      transform: rotateX(170deg);
    }

    20% {
      transform: rotateX(180deg);
    }

    60% {
      transform: rotateX(180deg);
    }

    80% {
      transform: rotateX(0);
    }

    100% {
      transform: rotateX(0);
    }
  }

  @keyframes rotatedrop {
    0% {
      transform: rotate(0);
    }

    10% {
      transform: rotate(30deg);
    }

    15% {
      transform: rotate(90deg);
    }

    70% {
      transform: rotate(90deg);
    }

    80% {
      transform: rotate(0);
    }

    100% {
      transform: rotateX(0);
    }
  }





  /* demo stuff */
  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  body {
    background-color: #f4f4f4;
    margin-bottom: 50px;
  }

  html,
  button,
  input,
  select,
  textarea {
    font-family: 'Montserrat', Helvetica, sans-serif;
    color: #bbb;
  }

  h1 {
    text-align: center;
    margin: 30px 15px;
  }

  .zoom-area {
    max-width: 490px;
    margin: 30px auto 30px;
    font-size: 19px;
    text-align: center;
  }

  .link-container {
    text-align: center;
  }

  a.more-link {
    text-transform: uppercase;
    font-size: 13px;
    background-color: #bbb;
    padding: 10px 15px;
    border-radius: 0;
    color: #fff;
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 5px;
    line-height: 1.5;
    text-decoration: none;
    margin-top: 50px;
    letter-spacing: 1px;
  }
</style>

<body>
  <h1>401 Unauthorized (No autorizado)</h1>
  <p class="zoom-area"><b>Hmmm!</b> No autorizado - "Inicia sesión para ver esto". </p>
  <section class="error-container">
    <span><span>4</span></span>
    <span>0</span>
    <span><span>1</span></span>
  </section>
  <div class="link-container">
    <a target="_blank" href="https://www.swaos.com.mx/" class="more-link">Visita la página principal</a>
  </div>
</body>

</html>