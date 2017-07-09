var md5 = require('blueimp-md5');
var common = require('../common.js');

var UserModel = require('../model/userModel.js');

module.exports ={
    getRegisterPage(req,res){
        // 访问注册页面
        res.render('./user/register');
    },
    getLoginPage(req,res){
        //访问登录页面
        res.render('./user/login');
    },
    registerNewUser(req,res){
        // 注册新用户
        var newuser = req.body;
        UserModel.sync()
          .then(()=>{
              // 能直接 create 吗？？
              // UserModel.create();
              // 在注册之前，先通过username 查找，看这个用户名是否被注册了
              // 使用 Model.count(),根据指定的条件，去查找符合条件的数据条数
              return UserModel.count({
                  where:{
                      username: newuser.username
                  }
              })
          })

          .then((count)=>{
              // 判断 查询出来的 count 值是否为0
              if(count === 0){
                  newuser.password = md5(newuser.password,common.pwdSalt);// 加盐MD5 加密
                  // 可以注册
                  return UserModel.create(newuser);
              }
              return null;
          })

          .then((result)=>{
              // 监听上一个then 中返回的是不是一个null
              // 如果是null 表示用户已被注册，返回客户端一个被注册的消息
              // 如果不为null ， 就表示新用户注册成功

              if(result === null){
                  // 注册失败
                  res.json({
                      err_code:1,
                      msg: '此用户名已被注册,请更换用户名后重试!'
                  });
              }else{
                  // 注册成功
                  res.json({
                      err_code:0
                  });
              }
          })
    },

    login(req,res){
        //用户登录
        var loginUser = req.body;
        //由于我们数据库中保存的用户密码已经没md5加密了，所以不能直接拿着123456 去匹配，这样永远都无法的登录成功
        // 我们可以在findOne 之前，把用户输入的明文密码， 在进行注册时候的 md5 加密
        // 由于md5 有一个特点，只要加密之前的字符串一致，那么加密的结果也是一致的
        loginUser.password =md5(loginUser.password,common.pwdSalt);
        // 根据表单post 提交过来的用户信息，去数据库中查找对应的用户
        // 如果找到了对应的用户 ，表示此用户存在，返回客户端“登录成功”、否则登录失败
        UserModel.sync()
         .then(()=>{
             //第一个then 的作用 是根据 指定的用户名和密码，查找对应的哟用户数据
             return UserModel.findOne({
                 //findOne 表示查找第一个匹配的数据
                 where:{
                     username:loginUser.username,
                     password: loginUser.password
                 }
             });
         })

         .then((result)=>{
             // 如果 findOne 找到了 对应的数据，则返回一个数据对象，否则没有找到，返回null
             if(result === null){
                 res.json({
                     //登录失败
                     err_code:1,
                     msg: '用户名或密码错误！'
                 });
             }else{
                 //登录成功
                 // 将登录成功的状态保存到了req.session 上
                 req.session.user = result;
                 console.log(req.session);

                 //返回给客户端的是登录消息
                 res.json({
                     err_code:0
                 });
             }
         })
    },

    logout(req,res){
        // 注销登录
        // 手动清空保存的登录信息
        req.session.destroy((err)=>{
            if(err) throw err;
            //使用服务器端重定向，传递一个跳转到了url 地址即可
            res.redirect('/');
        })
    }
}