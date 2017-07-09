var moment = require('moment');

// 作者表
var UserModel = require('./userModel.js');

// 每个表对象中，字段的属性类型，在Sequelize 中定义
var Sequelize = require('sequelize');

// 导入数据库连接对象，通过连接对象的.define 方法，定义一个表对象

var Db = require('./baseDb.js');

var Article = Db.define('articles',{
    id:{
        // 主键 id
        primaryKey: true,
        autoIncrement:true,
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER
    },
    title: { //文章标题
     allowNull: false,
     type: Sequelize.STRING
    },
    content:{
        // 文章内容
        allowNull: false,
        type: Sequelize.TEXT // 注意： 如果是大量文本的时候，使用text 类型，如果是文本还是用string,
        // 会存放文章内容被截取的问题

    },
    authorId:{
        //作者id ,将来，如果需要显示这篇文章的作者，可以通过authorId 去User表中找到对应作者的username 和Nickname
        allowNull: false,
        type: Sequelize.INTEGER
    }

},{
    getterMethods:{
        ctime(){
            // 格式化好的发表时间
            return moment(this.createdAt).fotmat('YYYY-MM-DD HH:mm:ss')

        },
        mtime(){
            // 格式化好的最后修改时间
            return moment(thi.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        }

    }
});

//当前得到文章属于哪个作者
// 也就是说： 文章表中的某一篇文章，属于作者表中的某一个作者
Article.belongsTo(UserModel,{
    foreignKey:'authorId',// Article 表通过foreignKey 指定对外关联的字段是authorId
    targetKey:'id' // 通过targetKey 来指定被关联的目标表(UserModel) 中关联字段是id

})

module.exports = Article;