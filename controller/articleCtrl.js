var ArticleModel = require('../model/articleModel.js');

var UserModel = require('../model/userModel.js');

var mditor = require('mditor');

module.exports ={
    showArticleAddPage(req,res) {
        // 展示文章添加页面
        if(!req.session.islogin){
            res.redirect('/login');
        }
        res.render('./article/add',{
            islogin: req.session.islogin,
            user: req.session.user
        });
    },

    addArticle(req,res){
        // 添加文章
        var newArticle = req.body;
        //这篇将要发表的文章，是当前登录用户发表
    // 所以， 我们要将当前文章的作者id, 设置为当前登录用户的id
    newArticle.authorId = req.session.user.id;
    ArticleModel.sync()
        .then(()=>{
            return ArticleModel.create(newArticle);

        })
        .then((results)=>{
            console.log(results);
            res.json({
                err_code:0,
                id: results.id
            });
        })

        .catch(err=>{
            res.json({
                err_code:1,
                msg:'文章添加失败！请稍后再试！'
            });
        });
    },
  showArticleInfo(req,res){
      // 展示文章详细
      // 通过req.query 获取都url 地址栏中的参数
      var id = req.query.id;
      ArticleModel.sync()
         .then(()=>{
             // 在查询文章信息的时候，顺便，把这个文章所属的作者信息也关联地查询出来
            return ArticleModel.findById(id,{
                include:[UserModel] //在查询文章的时候，把文章的作者信息也关联地查询出来

            });
         })

         .then((result)=>{
             // 由于在数据库这个保存的文章内容，是Markdown 格式的字符串，当我们渲染文章详细页面的时候，
             // 需要展示html 类型的内容，所以，我们需要借助于 mditor 提供的一个parse 方法，来将Markdown 字符串转换为html
             result.content =(new mditor.Parser()).parse(result.content);
             //如果能找到对应的文章，则返回文章对象， 如果找不到，则返回null
             if(result === null){
                 // 文章不存在
                 res.redirect('/');
             }else{
                 // 渲染文章详细页面
                 res.render('./article/info',{
                     islogin:req.session.islogin,
                     user: req.session.user,
                     article: result
                 });
             }
         })

  },
   showEditPage(req,res){
       //展示文章编辑页面
       // 先判断用户有没有登录，如果登录了，才展示编辑页面
       if(!req.session.islogin){
           //如果没有登录，则直接跳转都登录页面
           res.redirect('/login');
       }

       // 在展示编辑页面之前，先判断当前登录的用户id和被编辑文章的作者id,是否相等
       // 如果两个id 不想等，则不能展示编辑页面，直接跳转到哦首页
       // 从URl 地址栏的参数中，获取要编辑的文章的id
       var id = req.query.id;
       ArticleModel.sync()
         .then(()=>{
             return ArticleModel.findByPrimary(id);
         })
         .then(article=>{
             if(article === null){
                 // 文章不存在
                 res.redirect('/')
             }else{
                 // 文章存在
                 if(req.session.user.id === article.authorId){
                     //渲染编辑页面
                     res.render('./article/edit',{
                         islogin: req.session.islogin,
                         user: req.session.user,
                         article: article
                     });
                 }else{
                     // 不想等，表示用户是通过直接在url 地址栏输入编辑的URL地址，非法进来的
                     res.redirect('/');
                 }
             }
         })
   },

   editArticleById(req,res){
       // 保存最新编辑的文章
       var newArticle = req.body;
       ArticleModel.sync()
          .then(()=>{
              return ArticleModel.update({
                  title:newArticle.title,
                  content: newArticle.content
              },{
                  where:{
                      id: newArticle.id
                  }
              })
          })

          .then(result=>{
              // 如果编辑成功了,那么 result[0] ===1
            if(result[0] ===1){
                //编辑成功
                res.json({
                    err_code: 0
                });

            }else{
                // 编辑失败
                res.json({
                    err_code:1,
                    msg: '文章保存失败！请稍后再试!'
                });
            }
          });
   }


}