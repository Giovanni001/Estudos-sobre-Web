const express = require('express')
//criando rotas no express
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Página de posts')
})

router.get('/categorias', (req, res) => {
    //a função find lista todos os dados no banco de dados na pagina
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('./admin/categorias', { categorias: categorias })

    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome Invalido !' })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug Invalido !' })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da categoria é muito pequeno !' })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    }
    else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com Sucesso !')
            res.redirect('/admin/categorias')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, Tente novamente !')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })

    }).catch((error) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('admin/categorias')
    })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        var erros = []
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: 'Nome Invalido !' })
        }

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: 'Slug Invalido !' })
        }

        if (req.body.nome.length < 2) {
            erros.push({ texto: 'Nome da categoria é muito pequeno !' })
        }

        if (erros.length > 0) {
            res.render('admin/addcategorias', { erros: erros })
        }

        else {
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }

            //o campo categoria que nos queremos editar vai receber o novo valor que foi passado no formulario de edição
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((error) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
                res.redirect('/admin/categorias')
            }).catch((error) => {
                req.flash('error_msg', 'Houve um erro ao editar a Categoria')
                res.redirect('/admin/categorias')
            })

        }

    })

})

router.post('/categorias/deletar', (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso !')
        res.redirect('/admin/categorias')
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria !')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias })
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario')
    })

})

router.post('/postagens/nova', (req, res) => {
    var erros = []

    if (req.body.categoria == '0') {
        erros.push({ texto: 'Categoria inválida, registre uma categoria' })
    }

    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem ' + error)
            res.redirect('/admin/postagens')
        })
    }

})

//rota para editar as postagens
router.get('/postagens/edit/:id', (req, res) => {
    //id pq estamos passand o id como parametro
    //pesquizando por uma postagem
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        //pesquizando por uma categoria e dps renderizando isso em uma viewl
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', { categorias: categorias, postagem: postagem })
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario de edição')
        res.redirect('/admin/postagens')
    })
})

//criando uma rota que atualiza os dados das postagens
router.post('/postagem/edit', (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('sucess_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })

    }).catch((error) => {

        req.flash('error_msg', 'Houve um erro ao salvar a edição')
        res.redirect('/admin/postagens')
    })

})

router.get('/postagens/deletar/:id', (req,res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso !')
        res.redirect('/admin/postagens')
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem !')
        res.redirect('/admin/postagens')
    })
})



module.exports = router