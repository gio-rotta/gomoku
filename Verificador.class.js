function Verificador(tabuleiro, multiplicadorDefensivo) {

	this._jogo = tabuleiro;
	this._tabuleiro = tabuleiro._tabuleiro;
	this._multiplicadorDefensivo = multiplicadorDefensivo;

	this.verificarJogada = function(tabuleiro, peca, indiceNivel) {

		this._jogo = tabuleiro;
		this._tabuleiro = tabuleiro._tabuleiro;

		var linha = peca.linha;
		var coluna = peca.coluna;
		var cor = peca.cor;
		var corOposta = (cor == 1)? 2 : 1;

		var statusLinha = this.verificarLinhas(coluna, linha, cor);
		var statusColunas = this.verificarColunas(coluna, linha, cor);
		var statusDiagonalNoroeste = this.verificarDiagonalNoroeste(coluna, linha, cor);
		var statusDiagonalNordeste = this.verificarDiagonalNordeste(coluna, linha, cor);

		var pontos = this.calculoHeuristicas([statusLinha, statusColunas, statusDiagonalNordeste, statusDiagonalNoroeste]);

		var statusLinhaAdversaria = this.verificarLinhas(coluna, linha, corOposta);
		var statusColunasAdversaria = this.verificarColunas(coluna, linha, corOposta);
		var statusDiagonalNoroesteAdversaria = this.verificarDiagonalNoroeste(coluna, linha, corOposta);
		var statusDiagonalNordesteAdversaria = this.verificarDiagonalNordeste(coluna, linha, corOposta);

		//Cálculo dos pontos que o advrsário poderia realizar colocando uma peça na mesma casa, pontos de defesa.
		var pontosAdversario = this.calculoHeuristicas([statusLinhaAdversaria, statusColunasAdversaria, statusDiagonalNordesteAdversaria, statusDiagonalNoroesteAdversaria]);
		var pontos = pontos + (this._multiplicadorDefensivo * pontosAdversario);

		//console.log('linha',peca.linha,'coluna', peca.coluna, statusDiagonalNordeste,statusDiagonalNordesteAdversaria, pontos)
		return pontos * indiceNivel;
	}

	this.calculoHeuristicas = function(verificacoes) {
		var pontos = 0;

		verificacoes.forEach(function(verificacao) {
			// 1º - completar a sequência de 5;
		    if (verificacao.sequencias > 5 ) {
		    	pontos += 1000
		    } else

			// 1º - completar a sequência de 5;
		    if (verificacao.sequencias > 4 ) {
		    	pontos += 1000
		    } else

			// 2º - caso tenha uma sequência de 4 peças e espaço para mais 1 peça;
			if (verificacao.sequencias == 4 && verificacao.vazias > 0) {
				pontos += 100
			} else

			// 3º - caso tenha uma sequência de 3 peças e espaço de 1 ou mais peças nas extremidades da sequencia;
			if (verificacao.sequencias == 3 && verificacao.vaziasEsquerda > 1 && verificacao.vaziasDireita > 1) {
				pontos += 100
			} else

			// 4º - caso tenha uma sequência 2 peças e pelo menos mais 1 peça, em uma linha com espaçamento de pelo menos 6 casas;
			if (verificacao.sequencias + verificacao.vazias + verificacao.semiSequencias > 5 && verificacao.sequencias > 1 && verificacao.semiSequencias > 0) {
				pontos += 100
			} else

			if (verificacao.sequencias > 2 && verificacao.semiSequencias >= 1 && verificacao.vazias > 0) {
				pontos += 100
			} else

			if (verificacao.sequencias > 1 && verificacao.semiSequencias >= 1 && verificacao.vazias > 0) {
				pontos += 100
			} else

			// 5º - caso tenha uma sequência de 3 peças quando tiver a possibilidade de completar 5 casas e não seja a segunda heurística
			if (verificacao.sequencias == 3 && (verificacao.vaziasEsquerda > 1 || !verificacao.vaziasEsquerda > 1)) {
				pontos += 25
			} else

			// 6º - caso tenha uma sequência de 2 peças e espaço com pelo menos 5 casas vazias ou com peças próprias
			if (verificacao.sequencias == 3 && (verificacao.vazias + verificacao.semiSequencias) > 2) {
				pontos += 20
			} else

			// 7º - caso tenha uma sequência de 2 peças e espaço com pelo menos 5 casas vazias ou com peças próprias
			if (verificacao.sequencias == 3 && (verificacao.vazias + verificacao.semiSequencias) == 2) {
				pontos += 15
			} else

			// 8º - caso tenha uma sequência de 2 peças e espaço com pelo menos 5 casas vazias ou com peças próprias
			if (verificacao.sequencias == 2 && (verificacao.vazias + verificacao.semiSequencias) > 4) {
				pontos += 10
			} else

			// 9º - caso tenha uma sequência de 2 peças e espaço com pelo menos 3 casas vazias ou com peças próprias
			if (verificacao.sequencias == 2 && 4 > (verificacao.vazias + verificacao.semiSequencias) > 2) {
				pontos += 5
			}
			
			// 10 - heurística geral, cada sequência tem seu número de peças multiplicado por 4 e cada semisequencia tem seu número multiplicado por 2
			pontos += verificacao.sequencias * 10;
			pontos += verificacao.semiSequencias * 3;
			pontos += verificacao.vazias * 1;
		})

		return pontos;
	}

	this.verificarLinhas = function(coluna, linha, cor) {
		// os limites da verificacao de linha são 4 para esquerda e 4 para direita da peça a ser verificada
		var limiteEsquerda = (coluna - 6 > 0)? coluna - 6 : 0;
		var limiteDireita = (coluna + 6 > this._jogo.colunas)? this._jogo.colunas : coluna + 6;
		var sequencia = 0;
		var semiSequencia = 0;
		var vaziasEsquerda = 0;
		var vaziasDireita = 0;
		for (var i = coluna - 1; i >= limiteEsquerda; i--) {
			if (this._tabuleiro[linha][i] != 0) {
				if (this._tabuleiro[linha][i] == cor) {
					if (vaziasEsquerda > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasEsquerda++;
			}
		}

		for (var i = coluna + 1; i < limiteDireita; i++) {
			if (this._tabuleiro[linha][i] != 0) {
				if (this._tabuleiro[linha][i] == cor) {
					if (vaziasDireita > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasDireita++;
			}
		}

		var vazias = vaziasDireita + vaziasEsquerda;

		if (sequencia + semiSequencia + vazias >= 5) {
			return {
				sequencias: sequencia,
				semiSequencias: semiSequencia,
				vaziasEsquerda: vaziasEsquerda,
				vaziasDireita: vaziasDireita,
				vazias: vazias
			}	
		} else {
			return {
				sequencias: 0,
				semiSequencias: 0,
				vaziasEsquerda: 0,
				vaziasDireita: 0,
				vazias: 0
			}	
		}
		
	}

	this.verificarColunas = function(coluna, linha, cor) {
		var limiteCima = (linha - 6 > 0)? linha - 6 : 0;
		var limiteBaixo = (linha + 6 > this._jogo.linhas)? this._jogo.linhas : linha + 6;
		var sequencia = 0;
		var semiSequencia = 0;
		var vaziasCima = 0;
		var vaziasBaixo = 0;
		for (var i = linha - 1; i >= limiteCima; i--) {
			if (this._tabuleiro[i][coluna] != 0) {
				if (this._tabuleiro[i][coluna] == cor) {
					if (vaziasCima > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasCima++;
			}
		}

		for (var i = linha + 1; i < limiteBaixo; i++) {
			if (this._tabuleiro[i][coluna] != 0) {
				if (this._tabuleiro[i][coluna] == cor) {
					if (vaziasBaixo > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasBaixo++;
			}
		}

		var vazias = vaziasCima + vaziasBaixo;

		if (sequencia + semiSequencia + vazias >= 5) {
			return {
				sequencias: sequencia,
				semiSequencias: semiSequencia,
				vaziasEsquerda: vaziasCima,
				vaziasDireita: vaziasBaixo,
				vazias: vazias,
			}	
		} else {
			return {
				sequencias: 0,
				semiSequencias: 0,
				vaziasEsquerda: 0,
				vaziasDireita: 0,
				vazias: 0
			}	
		}
	}

	this.verificarDiagonalNoroeste = function(coluna, linha, cor) {

		var limiteCima = (linha - 6 > 0)? linha - 6 : 0;
		var limiteBaixo = (linha + 6 > this._jogo.linhas)? this._jogo.linhas : linha + 6;
		var limiteEsquerda = (coluna - 6 > 0)? coluna - 6 : 0;
		var limiteDireita = (coluna + 6 > this._jogo.colunas)? this._jogo.colunas : coluna + 6;

		var sequencia = 0;
		var semiSequencia = 0;
		var vaziasCima = 0;
		var vaziasBaixo = 0;

		var i = linha - 1;
		var j = coluna - 1;
		for (i , j; i >= limiteCima && j >= limiteEsquerda; i--, j--) {
			if (this._tabuleiro[i][j] != 0) {
				if (this._tabuleiro[i][j] == cor) {
					if (vaziasCima > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasCima++;
			}
		}

		var i = linha + 1;
		var j = coluna + 1;
		for (i , j; i < limiteBaixo && j < limiteDireita; i++, j++) {
			if (this._tabuleiro[i][j] != 0) {
				if (this._tabuleiro[i][j] == cor) {
					if (vaziasBaixo > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasBaixo++;
			}
		}

		var vazias = vaziasCima + vaziasBaixo;

		if (sequencia + semiSequencia + vazias >= 5) {
			return {
				sequencias: sequencia,
				semiSequencias: semiSequencia,
				vaziasEsquerda: vaziasCima,
				vaziasDireita: vaziasBaixo,
				vazias: vazias,
			}	
		} else {
			return {
				sequencias: 0,
				semiSequencias: 0,
				vaziasDireita: 0,
				vaziasEsquerda: 0,
				vazias: 0
			}	
		}
	}

	this.verificarDiagonalNordeste = function(coluna, linha, cor) {

		var limiteCima = (linha - 6 > 0)? linha - 6 : 0;
		var limiteBaixo = (linha + 6 > this._jogo.linhas)? this._jogo.linhas : linha + 6;
		var limiteEsquerda = (coluna - 6 > 0)? coluna - 6 : 0;
		var limiteDireita = (coluna + 6 > this._jogo.colunas)? this._jogo.colunas : coluna + 6;

		var sequencia = 0;
		var semiSequencia = 0;
		var vaziasCima = 0;
		var vaziasBaixo = 0;

		var i = linha - 1;
		var j = coluna + 1;
		for (i , j; i >= limiteCima && j < limiteDireita; i--, j++) {
			if (this._tabuleiro[i][j] != 0) {
				if (this._tabuleiro[i][j] == cor) {
					if (vaziasCima > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasCima++;
			}
		}

		var i = linha + 1;
		var j = coluna - 1;
		for (i , j; i < limiteBaixo && j >= limiteEsquerda; i++, j--) {
			if (this._tabuleiro[i][j] != 0) {
				if (this._tabuleiro[i][j] == cor) {
					if (vaziasBaixo > 0) {
						semiSequencia++;	
					} else {
						sequencia++;
					}
				} else {
					break;
				}
			} else {
				vaziasBaixo++;
			}
		}

		var vazias = vaziasCima + vaziasBaixo;

		if (sequencia + semiSequencia + vazias >= 5) {
			return {
				sequencias: sequencia,
				semiSequencias: semiSequencia,
				vaziasEsquerda: vaziasCima,
				vaziasDireita: vaziasBaixo,
				vazias: vazias,
			}	
		} else {
			return {
				sequencias: 0,
				semiSequencias: 0,
				vaziasDireita: 0,
				vaziasEsquerda: 0,
				vazias: 0
			}	
		}
	}
}