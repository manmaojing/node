// 导入 userRouter 路由模块
// var userRouter = require('./router/userRouter.js');
// app.use(userRouter);

// 问题： 由于将来会封装好多的路由模块，当路由模块多了之后，需要每次都来到app.js 中，手动require 路由模块。并注册
// 解决方案： 想办法， 让程序启动 的时候，自己注册/ router 文件夹下面的所有与路由模块
// 使用 fs.readdir 方法，读取/ router 目录下面所有文件，然后得到每一个路由模块的文件路径
// 当得到每个路由模块的文件路径之后，调用 for 循环，循环使用 require 导入每个路由模块，并使用 app.use 来注册每个导入的路由模块
fs.readdir(path.join(__dirname,'./router'),(err,filenames)=>{
  if(err) throw err;
  filenames.forEach(filename=>{
      //这个routerPath 就是每个路由模块 对应的require 时候的path

      var routerPath = path.join(__dirname,'./router',filename);
    // 根据每个路由模块的路径 ，自动require 路由模块
    
    var routerModule = require(routerPath);

    // 根据自动 require 进来的路由模块，自动去注册这个路由模块
    app.use(routerModule);

  });  
});

// 调用 app.listen 方法 ，指定端口号 并启动web服务器

app.listen(3003,function(){
    console.log('Express server running at http://127.0.0.1:3003');
});