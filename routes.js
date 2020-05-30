fs = require('fs');
request = require('request');
cheerio = require('cheerio');


module.exports = function(app) {

  //Exemplo de módulo para cada componente da aplicação
  //var Mod1 = require('./Mod1');
  //app.use('/mod1', Mod1)

  var dbfun = require('./db');

  //Criptografia da senha
  var sha1 = require('sha1');
  
  app.get('/getPrecoSite/:link/:idProduto/:idLoja', function(req, res) {
    // Passo 2
    let
      link = req.params.link,
      idProduto = req.params.idProduto,
      idLoja = req.params.idLoja;
    const nomeloja = link.split('.');
    url = link;
    request(url, function(error, response, html) {
        if (!error) {
            let $ = cheerio.load(html);
        
            // Objeto que irá armazenar a tabela
            // Passo 3
            // Manipulando o seletor específico para montar nossa estrutura
            // Escolhi não selecionar a primeira linha porque faz parte do header da tabela
            if(nomeloja[1] == 'magazinevoce'){
              $('.pdetailpage').each(function(i) {
                  // Obtendo as propriedades da tabela. 
                  // O método .trim() garante que irá remover espaço em branco
                  let preco,parcelas;
                    preco = $(this).find('strong').eq(0).text().trim();
                    $('.p-installment').each(function(i){
                        parcelas = $(this).find('span').eq(0).text().trim();
                    })
                  
                  // Inserindo os dados obtidos no nosso objeto
                  res.json([{preco: preco, parcelas: parcelas, idProduto: idProduto, idLoja: idLoja}]);
              });
            }else if(nomeloja[1] == 'americanas'){
              $('.main-price').each(function(i) {
                // Obtendo as propriedades da tabela. 
                // O método .trim() garante que irá remover espaço em branco
                let preco,parcelas;
                  preco = $(this).find('span').eq(0).text().trim();
                  $('.installment-wrapper').each(function(i){
                      parcelas = $(this).find('p').eq(0).text().trim();
                  })
                
                // Inserindo os dados obtidos no nosso objeto
                res.json([{preco: preco, parcelas: parcelas, idProduto: idProduto, idLoja: idLoja}]);
              });
            }else if(nomeloja[1] == 'amazon'){
              $('#priceblock_ourprice').each(function(i) {
                // Obtendo as propriedades da tabela. 
                // O método .trim() garante que irá remover espaço em branco
                let preco,parcelas;
                  preco = $(this).text().trim();
                  $('#installmentCalculator_feature_div').each(function(i){
                      parcelas = $(this).find('span').eq(0).text().trim();
                  })
                
                // Inserindo os dados obtidos no nosso objeto
                res.json([{preco: preco, parcelas: parcelas, idProduto: idProduto, idLoja: idLoja}]);
              });
            }
            
        }
    })
  })

  app.post('/cadastrarProduto', function(req, res) {  /// Cadastra um novo produto
    produtos = new dbfun.Produtos();
    produtos.query("INSERT INTO `comparie`.`produtos`(`imagemProduto`, `nomeProduto`, `idTipo`, `idNicho`, `descricao`, `review`, `idMarca`)VALUES('"
      + req.body.imagemProduto + "','"
      + req.body.nomeProduto + "','"
      + req.body.idTipo + "','"
      + req.body.idNicho + "','"
      + req.body.descricao + "','"
      + req.body.review + "','"
      + req.body.idMarca +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Produto'
          });
        }else{
          res.json({
            status: true,
            message: 'Produto Cadastrado'
          });
        }
      });

  });

  app.put('/editarProduto/:idProduto', function(req, res) { /// Edita um obra a partir de seus dados
    produto = new dbfun.Produtos(); /// Conexão com o banco
    produto.query("UPDATE `comparie`.`produtos` SET `imagemProduto` = '"+ req.body.imagemProduto
      +"',`nomeProduto` = '"+ req.body.nomeProduto
      +"',`idTipo` = '"+ req.body.idTipo
      +"',`idNicho` = '"+ req.body.idNicho
      +"',`descricao` = '"+ req.body.descricao
      +"',`review` = '"+ req.body.review
      +"',`idMarca` = '"+ req.body.idMarca
      +"'WHERE `idProduto` = '"+req.params.idProduto+"';",  /// Atualiza os dados com a query do banco a patir do id
      function(err) { // Caso ocorra um erro
        if(err)
          res.send(err);
      });
    res.json({  /// Caso ocorra com sucesso
      status: true,
      message: 'Produto Atualizado'
    });
  });

  app.put('/editarProdutoClique/:idProduto', function(req, res) { /// Edita um obra a partir de seus dados
    produto = new dbfun.Produtos(); /// Conexão com o banco
    produto.query("UPDATE `comparie`.`produtos` SET `cliques` = '"+ req.body.cliques
      +"'WHERE `idProduto` = '"+req.params.idProduto+"';",  /// Atualiza os dados com a query do banco a patir do id
      function(err) { // Caso ocorra um erro
        if(err)
          res.send(err);
      });
    res.json({  /// Caso ocorra com sucesso
      status: true,
      message: 'Produto Atualizado'
    });
  });

  app.get('/getProdutos', function(req, res) { /// Retorna do banco todos os status cadastrados
    produtos = new dbfun.Produtos();
    //console.log("ELE TA AQUI");
    // trecho.query("select t.idTrecho, e.nomeEscopo from escTrecho as es, trecho as t, escopo as e where t.idTrecho = es.idTrecho and es.idEscopo = e.idEscopo",
    produtos.query("SELECT * FROM produtos;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getProduto/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    produto = new dbfun.Produtos();
    produto.query("SELECT * FROM `comparie`.`produtos` WHERE idProduto=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarCategoria', function(req, res) {  /// Cadastra uma nova categoria
    categorias = new dbfun.Categorias();

    categorias.query("INSERT INTO `comparie`.`categorias` (`nomeCategoria`) VALUES('"
      + req.body.nomeCategoria +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Categoria'
          });
        }else{
          res.json({
            status: true,
            message: 'Categoria Cadastrada'
          });
        }
      });

  });

  app.get('/getCategorias', function(req, res) { /// Retorna do banco todos os status cadastrados
    categorias = new dbfun.Categorias();
    categorias.query("SELECT * FROM categorias;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getCategoria/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    categoria = new dbfun.Categorias();
    categoria.query("SELECT * FROM `comparie`.`categorias` WHERE idCategoria=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarMarca', function(req, res) {  /// Cadastra uma nova categoria
    marcas = new dbfun.Marcas();

    marcas.query("INSERT INTO `comparie`.`marcas` (`nomeMarca`) VALUES('"
      + req.body.nomeMarca +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Marca'
          });
        }else{
          res.json({
            status: true,
            message: 'Marca Cadastrada'
          });
        }
      });

  });

  app.get('/getMarcas', function(req, res) { /// Retorna do banco todos os status cadastrados
    marcas = new dbfun.Marcas();
    marcas.query("SELECT * FROM marcas;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getMarca/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    marca = new dbfun.Marcas();
    marca.query("SELECT * FROM `comparie`.`marcas` WHERE idMarca=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarLoja', function(req, res) {  /// Cadastra uma nova loja
    lojas = new dbfun.Lojas();

    lojas.query("INSERT INTO `comparie`.`lojas` (`nomeLoja`) VALUES('"
      + req.body.nomeLoja + "');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Loja'
          });
        }else{
          res.json({
            status: true,
            message: 'Loja Cadastrada'
          });
        }
      });

  });

  app.get('/getLojas', function(req, res) { /// Retorna do banco todos os status cadastrados
    lojas = new dbfun.Lojas();
    lojas.query("SELECT * FROM lojas;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getLoja/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    loja = new dbfun.Lojas();
    loja.query("SELECT * FROM `comparie`.`lojas` WHERE idLoja=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarNicho', function(req, res) {  /// Cadastra um novo nicho
    nichos = new dbfun.Nichos();

    nichos.query("INSERT INTO `comparie`.`nichos` (`nomeNicho`) VALUES('"
      + req.body.nomeNicho +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Nicho'
          });
        }else{
          res.json({
            status: true,
            message: 'Nicho Cadastrado'
          });
        }
      });

  });

  app.get('/getNichos', function(req, res) { /// Retorna do banco todos os status cadastrados
    nichos = new dbfun.Nichos();
    nichos.query("SELECT * FROM nichos;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getNicho/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    nicho = new dbfun.Nichos();
    nicho.query("SELECT * FROM `comparie`.`nichos` WHERE idNicho=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarTipo', function(req, res) {  /// Cadastra um novo nicho
    tipos = new dbfun.Tipos();

    tipos.query("INSERT INTO `comparie`.`tipos` (`nomeTipo`) VALUES('"
      + req.body.nomeTipo +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar Tipo'
          });
        }else{
          res.json({
            status: true,
            message: 'Tipo Cadastrado'
          });
        }
      });

  });

  app.get('/getTipos', function(req, res) { /// Retorna do banco todos os status cadastrados
    tipos = new dbfun.Tipos();
    tipos.query("SELECT * FROM tipos;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.post('/cadastrarProdutoLoja', function(req, res) {  /// Cadastra um novo nicho
    produtolojas = new dbfun.ProdutoLoja();
    produtolojas.query("INSERT INTO `comparie`.`produtoloja` (`idLoja`, `idProduto`, `link`, `preco`, `parcelas`, `quantidade`) VALUES('"
      + req.body.idLoja + "','"
      + req.body.idProduto + "','"
      + req.body.link + "','"
      + req.body.preco + "','"
      + req.body.parcelas + "','"
      + req.body.quantidade +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar relacionamento Produto Loja'
          });
        }else{
          res.json({
            status: true,
            message: 'Relacionamento Produto Loja Cadastrado'
          });
        }
      });

  });

  app.put('/editarProdutoLoja/:idProduto/:idLoja', function(req, res) { /// Edita um obra a partir de seus dados
    produtoloja = new dbfun.ProdutoLoja(); /// Conexão com o banco
    produtoloja.query("UPDATE `comparie`.`produtoloja` SET `quantidade` = '"+ req.body.quantidade
    +"',`preco` = '"+ req.body.preco
    +"',`parcelas` = '"+ req.body.parcelas
    +"',`estoque` = '"+ req.body.estoque
    +"'WHERE `idProduto` = '"+req.params.idProduto+"'AND `idLoja` = '"+req.params.idLoja+"';",  /// Atualiza os dados com a query do banco a patir do id
      function(err) { // Caso ocorra um erro
        if(err)
          res.send(err);
      });
    res.json({  /// Caso ocorra com sucesso
      status: true,
      message: 'ProdutoLoja Atualizado'
    });
  });

  app.get('/getProdutoLojas', function(req, res) { /// Retorna do banco todos os status cadastrados
    produtolojas = new dbfun.ProdutoLoja();
    produtolojas.query("SELECT * FROM produtoloja;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getProdutoLoja/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    produtoloja = new dbfun.ProdutoLoja();
    produtoloja.query("SELECT * FROM `comparie`.`produtoloja` WHERE idProduto=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.get('/getLojaProduto/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    produtoloja = new dbfun.ProdutoLoja();
    produtoloja.query("SELECT * FROM `comparie`.`produtoloja` WHERE idLoja=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarProdutoCategoria', function(req, res) {  /// Cadastra um novo nicho
    produtocategorias = new dbfun.ProdutoCategoria();
    produtocategorias.query("INSERT INTO `comparie`.`produtocategoria` (`idCategoria`, `idProduto`, `quantidade`) VALUES('"
      + req.body.idCategoria + "','"
      + req.body.idProduto + "','"
      + req.body.quantidade +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar relacionamento Produto Categoria'
          });
        }else{
          res.json({
            status: true,
            message: 'Relacionamento Produto Categoria Cadastrado'
          });
        }
      });
  });

  app.put('/editarProdutoCategoria/:idProduto/:idCategoria', function(req, res) { /// Edita um obra a partir de seus dados
    produtocategoria = new dbfun.ProdutoCategoria(); /// Conexão com o banco
    produtocategoria.query("UPDATE `comparie`.`produtocategoria` SET `quantidade` = '"+ req.body.quantidade
    +"'WHERE `idProduto` = '"+req.params.idProduto+"'AND `idCategoria` = '"+req.params.idCategoria+"';",  /// Atualiza os dados com a query do banco a patir do id
      function(err) { // Caso ocorra um erro
        if(err)
          res.send(err);
      });
    res.json({  /// Caso ocorra com sucesso
      status: true,
      message: 'ProdutoCategoria Atualizado'
    });
  });

  app.get('/getProdutoCategorias', function(req, res) { /// Retorna do banco todos os status cadastrados
    produtocategorias = new dbfun.ProdutoCategoria();
    produtocategorias.query("SELECT * FROM produtocategoria;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

  app.get('/getProdutoCategoria/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    produtocategoria = new dbfun.ProdutoCategoria();
    produtocategoria.query("SELECT * FROM `comparie`.`produtocategoria` WHERE idProduto=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.get('/getCategoriaProduto/:id', function(req, res) { /// Retorna uma obra a partir de seu id
    produtocategoria = new dbfun.ProdutoCategoria();
    produtocategoria.query("SELECT * FROM `comparie`.`produtocategoria` WHERE idCategoria=" + req.params.id + ";",
    function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
    });
  });

  app.post('/cadastrarTipoCategoria', function(req, res) {  /// Cadastra um novo nicho
    tipocategorias = new dbfun.TipoCategoria();
    tipocategorias.query("INSERT INTO `comparie`.`tipocategoria` (`idTipo`, `idCategoria`) VALUES('"
      + req.body.idTipo + "','"
      + req.body.idCategoria +"');",
      function(err) {
        if(err){
          res.json({
            status: false,
            message: 'Erro ao Cadastrar relacionamento Tipo Categoria'
          });
        }else{
          res.json({
            status: true,
            message: 'Relacionamento Tipo Categoria Cadastrado'
          });
        }
      });
  });

  app.get('/getTipoCategorias', function(req, res) { /// Retorna do banco todos os status cadastrados
    tipocategorias = new dbfun.TipoCategoria();
    tipocategorias.query("SELECT * FROM tipocategoria;",
    function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
      res.json(rows);
    });
  });

}