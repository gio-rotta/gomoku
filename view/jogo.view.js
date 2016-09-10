
var Peca = Backbone.Model.extend({
  defaults: {
    "cor": 1,
  },

  initialize: function() {

  }

});

var TabuleiroModel = Backbone.Model.extend({
  
  defaults: {
    "linhas": 9,
    "colunas": 9,
    "brancas": [],
    "nBrancas": 0,
    "pretas": [],
    "nPretas": 0,
    "tabuleiro": [],
    "valorAcumulado": 0
  },

  initialize: function() {
    for (var i = 0; i < this.colunas; i++) {
      var linha = []
      for (var i = 0; i < this.linhas; i++) {
        linha.push(0)
      }
      this.tabuleiro.push(linha)
    } 
  }
});

var PecasCollection = Backbone.Collection.extend({
  model: Peca
});

var PecaView = Backbone.View.extend({

  tagName: "div",
  model: Peca,

  initialize: function() {
    var cor = (this.model.get('cor') == 1)? 'peca branca' : 'peca preta';
    this.$el.attr('class', cor);
  },

});


var CasaView = Backbone.View.extend({
  tagName: "div",
  className: 'casa',

  events: {
    "click" : "adicionarPeca"
  },

  initialize: function(options) {
    this.parentView = options.parentView;
    this.pecasJogador = options.pecasJogador;
    this.pecasComputador = options.pecasComputador;
    this.temPeca = false;
    this.linha = options.linha;
    this.coluna = options.coluna;
    this.$el.addClass(options.linha+'-'+options.coluna);
  },

  adicionarPeca: function() {
    if (this.temPeca == false) {
      this.temPeca = true
      var peca = new Peca({cor:this.parentView.corPecaJogador, linha:this.linha, coluna: this.coluna})
      this.pecasJogador.add(peca);
      var pecaView = new PecaView({model:peca})
      this.$el.append(pecaView.el);
    }
  },

  adicionarPecaComputador: function() {
    if (this.temPeca == false) {
      this.temPeca = true
      var peca = new Peca({cor:this.parentView.corPecaComputador, linha:this.linha, coluna: this.coluna})
      this.pecasComputador.add(peca);
      var pecaView = new PecaView({model:peca})
      this.$el.append(pecaView.el);
    }
  }

});


var TabuleiroView = Backbone.View.extend({

  model: TabuleiroModel,

  initialize: function(options) {
    this.corPecaJogador = options.cor;
    this.corPecaComputador = (options.cor == 1)? 2 : 1;
    this.pecasJogador = new PecasCollection();
    this.pecasComputador = new PecasCollection();
    this.tabuleiroArray = [];
    this.tabuleiro = new Tabuleiro(this.model.get('colunas'), this.model.get('linhas'));
    this.verificador = new Verificador(this.tabuleiro, 1);
    this.grafo = new Grafo();
    this.gerador = new GeradorEstados(this.tabuleiro, 4, this.verificador, this.grafo, 0);
    this.verticeRaiz = this.gerador._index;
    this.render();
    this.listenTo(this.pecasJogador, 'add', this.ativarInteligenciaArtificial);
  },

  render: function() {
    // Gerar Tabuleiro vazio
    this.tabuleiro.novoTabuleiro();
    for (var i = 0; i < this.model.get('linhas'); i++) {
      var linha = []
      for (var j = 0; j < this.model.get('colunas'); j++) {
        var casa = new CasaView({parentView : this, pecasJogador: this.pecasJogador, pecasComputador: this.pecasComputador, linha:i, coluna:j});
        linha.push(casa);
        this.$el.append(casa.el);
      }
      this.tabuleiroArray.push(linha)
    }  
  },

  ativarInteligenciaArtificial: function(peca) {
    $('.carregando').toggleClass('hidden')
    _.defer(function() {
      this.tabuleiro.adicionarPeca(peca.get('cor'), peca.get('linha'), peca.get('coluna'));

      if(this.verticeRaiz == 0) {
        this.grafo.adicionaVertice(this.gerador._index, this.tabuleiro);
      } else { 
        this.grafo.adicionaVertice(++this.gerador._index, this.tabuleiro);
      }

      this.gerador.gerarNovosEstados(this.verticeRaiz, this.tabuleiro, this.corPecaComputador);

      //segundo nivel
      this.grafo.emitidos(this.verticeRaiz).forEach(function(vertice) {

        var tabuleiroRaiz = this.grafo.dadosDoVertice(vertice);
        this.gerador.gerarNovosEstados(vertice, tabuleiroRaiz, this.corPecaJogador);

        //terceiro nivel
        // this.grafo.emitidos(vertice).forEach(function(vertice) {

        //   var tabuleiroRaiz = this.grafo.dadosDoVertice(vertice);
        //   this.gerador.gerarNovosEstados(vertice, tabuleiroRaiz, this.corPecaComputador);
    
        // }.bind(this))

      }.bind(this))

      this.verticeRaiz = this.grafo.buscaMinMaxComPoda(this.verticeRaiz, "computador", {score:-Infinity}, {score: Infinity}).id;

      //2º nivel - pegar um nivel antes e remover filhos
      this.verticeRaiz = this.grafo.recebidos(this.verticeRaiz)[0];
      this.grafo.emitidos(this.verticeRaiz).forEach(function(v) {
        this.grafo.removeVertice(v);
      }.bind(this))

      //1º nivel - pegar um nivel antes e remover filhos
      // this.verticeRaiz = this.grafo.recebidos(this.verticeRaiz)[0];
      // this.grafo.emitidos(this.verticeRaiz).forEach(function(v) {
      //   this.grafo.removeVertice(v);
      // }.bind(this))

      this.tabuleiro = this.grafo.dadosDoVertice(this.verticeRaiz);
      var pecaResultante = this.tabuleiro._ultimaPreta;

      this.tabuleiroArray[pecaResultante.linha][pecaResultante.coluna].adicionarPecaComputador();

      $('.carregando').toggleClass('hidden')
    }.bind(this))
  }

});