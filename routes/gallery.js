const multer = require('multer')
const fs = require('fs')
const conexao = require('../config/database')

module.exports = (app)=>{

    //importar o config database
    var database = require('../config/database')
    //importar o model gallery
    var gallery = require('../models/gallery')

    //exibir o formulario gallery.ejs
    app.get('/gallery',async(req,res)=>{
        //conectar com o database
        database()
        //executar a busca de documentos da coleção gallery
        var documentos = await gallery.find().sort({_id:-1})
        res.render('gallery.ejs',{dados:documentos})
    })

    //importar a config do multer
    var upload = require('../config/multer')
    //upload do arquivo
    app.post('/gallery',(req,res)=>{
        //upload das imagens
        upload(req,res,async (err)=>{
            if(err instanceof multer.MulterError){
                res.send("O arquivo é maior que 100kb")
            }else if(err){
                res.send('Tipo de Arquivo inválido')
            }else{
                //conectar ao database
                database()
                //gravar o nome do arquivo na coleção gallery
                var documento = await new gallery({
                arquivo:req.file.filename
                }).save()
                res.redirect('/gallery')

            }
        })
    })

    //visualizar a imagem selecionada
    app.get('/alterar_gallery', async(req,res)=>{
        //recuperar o parâmetro id na barra de endereço
        var id = req.query.id
        //procurar por um documento com o id
        var busca = await gallery.findOne({_id:id})
        //abrir o arquivo gallery_alterar
        res.render('gallery_alterar.ejs',{dados:busca})
    })

    //alterar a imagem gravada no documento
    app.post('/alterar_gallery',(req,res)=>{
        //upload das imagens
        upload(req,res,async (err)=>{
            if(err instanceof multer.MulterError){
                //res.send("O arquivo é maior que 100kb")
                res.render('erros.ejs', { erro:"Arquivo maior que o limite"})
            }else if(err){
                //res.send('Tipo de Arquivo inválido')
                res.render('erros.ejs',{ erro : "Tipo de arquivo Inválido"})
            }else{
                //conectar ao database
                database()
                //excluir o arquivo anterior
                try{
                    fs.unlinkSync('uploads/'+req.body.anterior)
                } catch (error) {

                }
                
                //Alterar o nome do arquivo na coleção gallery
                var documento = await gallery.findOneAndUpdate(
                    {_id:req.query.id},
                    {arquivo:req.file.filename}
                )
                res.redirect('/gallery')

            }
        })
    })

    //visualizar a imagem selecionada
    app.get('/excluir_gallery', async(req,res)=>{
        //recuperar o parâmetro id na barra de endereço
        var id = req.query.id
        //procurar por um documento com o id
        var busca = await gallery.findOne({_id:id})
        //abrir o arquivo gallery_alterar
        res.render('gallery_excluir.ejs',{dados:busca})
    })

    app.post("/excluir_gallery",async(req,res)=>{
        //recuperar o id na barra de endereço
        var id = req.query.id
        //excluir arquivo anterior
        try{
            fs.unlink('uploads/'+req.body.anterior)
        } catch (error) {
            
        }
        fs.unlinkSync('uploads/'+req.body.anterior)
        //var excluir e excluir doc
        var excluir = await gallery.findOneAndRemove({_id:id})
        //Voltar para a página mygrid
        res.redirect("/gallery")   
    })  

}