var express = require('express');
var router = express.Router();
const crypto = require('crypto');

/* GET home page. */
router.get('/wechat/hello', function(req, res, next) {
  res.render('index', { title: 'Hello Wechat from Aliyum.' });
});

const token = 'WKyAqZGSnjLEym3w0gqz';
const handleWechatRequest = function(req, res, next){
    const { signature, timestamp, nonce,echostr } = req.query;

    if( !signature || !timestamp || !nonce ){
     return res.send('Invalid request.');
    }

    if( req.method == 'POST' ){
        console.log('handleWechatRequest.post:' , { body: JSON.stringify(req.body), query: req.query });
    }
    if( req.method == 'GET' ){
        console.log('handleWechatRequest.get:' , { body: req.body});
        if( !echostr ){
            return res.send('Invalid request.');
        }
    }


    //1）将token、timestamp、nonce三个参数进行字典序排序
    const params = [token, timestamp, nonce];
    params.sort();
    //2）将三个参数字符串拼接成一个字符串进行sha1加密
    const hash = crypto.createHash('sha1');
    const sign = hash.update(params.join('')).digest('hex');
    //3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(signature === sign){
        if(req.method === 'GET'){
            res.send( echostr ? echostr : 'Invalid request.' );
        }else{
            const tousername = req.body.xml.tousername[0].toString();
            const fromusername = req.body.xml.fromusername[0].toString();
            const createtime = req.body.xml.createtime[0].toString();
            const msgtype = req.body.xml.msgtype[0].toString();
            const content = req.body.xml.content[0].toString();
            const msgid = req.body.xml.msgid[0].toString();
            const restime = Math.round(Date.now() / 1000);

            const response = `<xml>
            <ToUserName><![CDATA[${fromusername}]]></ToUserName>
            <FromUserName><![CDATA[${tousername}]]></FromUserName>
            <CreateTime>${restime}</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[Baoao, I Love You! Mula~~~]]></Content>
            </xml>`;


            res.set('ContentType', 'text/xml');
            res.send(response);

        }
    }else{
        res.send('Invalid sign.');
    }
};

router.get('/wechat/api',handleWechatRequest);
router.post('/wechat/api',handleWechatRequest);



module.exports = router;
