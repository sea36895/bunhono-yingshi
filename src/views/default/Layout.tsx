import type { FC, PropsWithChildren } from "hono/jsx";
import type { PageContext } from "../../index";

interface LayoutProps {
  ctx: PageContext;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
}

const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  ctx,
  seoTitle,
  seoKeywords,
  seoDescription,
  children,
}) => {
  // API 源切换时重定向到首页，避免不同源之间 ID 不匹配
  const headScript = `
function changeApi(){var e=document.getElementById("api-selector").value;document.cookie="api_select="+e+"; path=/; max-age=2592000";window.location.href=window.location.origin+"/";}
function getCookie(n){var v="; "+document.cookie,p=v.split("; "+n+"=");return 2===p.length?p.pop().split(";").shift():"";}
document.addEventListener("DOMContentLoaded",function(){var s=document.getElementById("api-selector");if(s){s.value=getCookie("api_select")||"1";}});`;

  // 当前选中的 API 索引（1-based），用于服务端直接设置 selected
  const currentApiNum = parseInt(ctx.currentApi, 10) || 1;

  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,user-scalable=no"
        />
        <meta name="applicable-device" content="pc,mobile" />
        <title>{seoTitle}</title>
        <meta name="keywords" content={seoKeywords} />
        <meta name="description" content={seoDescription} />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body id="body">
        <header>
          <div class="head">
            <div class="logo">
              <a href={ctx.baseUrl}>{ctx.siteName}</a>
            </div>
            <div class="api-select">
              <select id="api-selector" onchange="changeApi()">
                {ctx.apiList.map((api, idx) => (
                  <option value={String(idx + 1)} selected={idx + 1 === currentApiNum}>
                    {api.name}
                  </option>
                ))}
              </select>
            </div>
            <div class="search-box">
              <form action={ctx.baseUrl} method="get">
                <input class="search-input" name="key" type="search" placeholder="请输入关键词搜索" />
                <button class="search-button" type="submit">搜索</button>
              </form>
            </div>
          </div>
          <nav class="navbar">
            <div class="nav-container">
              <ul class="menu">
                <li class={ctx.pageType === "list" && !ctx.sortId ? "current" : ""}>
                  <a href={ctx.baseUrl}>最近更新</a>
                </li>
                {ctx.categories.slice(1).map((cat) => (
                  <li class={ctx.currentCategory === cat.分类名 ? "current" : ""}>
                    <a href={`${ctx.baseUrl}?sort=${cat.分类号}`}>
                      {cat.分类名}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>
        {children}
        <footer>
          <p>Powered by {ctx.siteName}</p>
          <p>联系邮箱：{ctx.siteEmail}</p>
        </footer>
      </body>
    </html>
  );
};

// ==================== 内联样式 ====================
const STYLES = `
@charset "utf-8";
*{padding:0;margin:0}
body{margin:0;padding:0;width:100%;color:#666;word-break:break-all;word-wrap:break-word;font-family:"Segoe UI","Microsoft YaHei","Hiragino Sans GB",sans-serif;font-size:14px}
img,p,ul,li,dl,dd,dt,h1,h2,h3,input{margin:0;border:0;padding:0}
em,i{font-style:normal}
img{border:0}
a:active{outline:0 none}
a:focus{outline:0}
a:link{color:#333;text-decoration:none}
a:visited{color:#333;text-decoration:none}
a:hover{color:#f60;text-decoration:none;transition:all .3s ease}
li{list-style:none}
.clearfix:after{display:block;clear:both;visibility:hidden;height:0;content:''}
.clearfix{zoom:1}
input,select,textarea,button{font-size:14px;outline:0;box-sizing:content-box}
button,input[type=button],input[type=submit]{cursor:pointer}
input[type=search]{-webkit-appearance:textfield}
input:focus::-webkit-input-placeholder{color:transparent}
textarea{resize:vertical;overflow-y:auto}
body{background-color:#F6F5F6}
select#api-selector{height:28px;padding:0 4px}

@media screen and (min-width:769px){
  .pcnone{display:none}
  header{margin:0;padding:0;background:#fff;margin-bottom:10px}
  header .head{width:1000px;margin:0 auto;padding-top:15px;padding-bottom:15px;overflow:hidden}
  header .head .logo{float:left;width:180px;height:50px;overflow:hidden;font-size:24px;font-weight:bold;color:#333;line-height:50px}
  header .head .logo a{color:#333;text-decoration:none}
  header .head .api-select{float:left;margin:7px 10px 0 0}
  header .head .api-select select{min-width:90px;padding:5px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:14px;color:#333;cursor:pointer}
  header .head .search-box{float:right;height:50px;line-height:50px}
  header .head .search-box form{overflow:hidden;margin-top:7px}
  header .head .search-box .search-input{float:left;width:220px;height:33px;line-height:33px;font-size:14px;color:#999;text-indent:9px;border:1px solid #ccc;border-radius:4px 0 0 4px;background:#fff}
  header .head .search-box .search-button{float:left;width:50px;height:33px;line-height:33px;background:#398439;border-radius:0 4px 4px 0;border:1px solid #09C878;color:#fff;font-size:14px;font-weight:400}
  header .navbar{background:#09C878;border:none;border-radius:0;margin-bottom:10px;min-height:40px}
  header .navbar .nav-container{width:1000px;height:40px;margin:0 auto;overflow:hidden}
  header .navbar .nav-container ul.menu{float:left;margin:0}
  header .navbar .nav-container ul.menu li{float:left;height:40px;line-height:40px}
  header .navbar .nav-container ul.menu li a{color:#fff;padding:12px}
  header .navbar .nav-container ul.menu li a:hover{background:#09C878}
  header .navbar .nav-container ul.menu li.current a{background:#398439}
  .main-container{width:1000px;margin:0 auto;min-height:500px}
  .main-container .box-title{height:26px;line-height:26px;padding:10px 0}
  .main-container .box-title b{display:block;float:left;height:26px;line-height:26px;padding-left:10px;border-left:8px solid #00A6DE;color:#444;font-size:24px;font-weight:400}
  .main-container .box-body .box-item{float:left;border-radius:3px;background:#FFF;overflow:hidden;box-sizing:border-box;transition:box-shadow .3s ease}
  .main-container .box-body .box-item:hover{box-shadow:2px 2px 10px #CCC}
  .main-container .box-body .box-item .item-link{position:relative;display:block;width:100%;overflow:hidden}
  .main-container .box-body .box-item .item-link img{border:1px solid #ccc;padding:1px;width:100%;height:100%;box-sizing:border-box}
  .main-container .box-body .box-item .item-link .hdtag{background:#09C878;padding:2px 5px;color:#FFF;font-size:12px;right:2px;bottom:2px;position:absolute;border:none}
  .main-container .box-body .box-item .meta{margin-top:5px}
  .main-container .box-body .box-item .meta .item-name{width:100%;overflow:hidden;height:20px}
  .main-container .box-body .box-item .meta .item-name a{font-size:14px;color:#333;text-overflow:ellipsis;white-space:nowrap;width:100%;overflow:hidden;display:inline;float:left}
  .main-container .box-body .box-item .meta em{font-size:12px;color:#8c8c8c}
  .main-container .box-body .box-item .meta em strong span{color:#FF0000}
  .main-container .row-five{overflow:hidden;margin-bottom:10px}
  .main-container .row-five .box-body .box-item{width:188px;margin-right:15px;margin-bottom:15px;padding:8px}
  .main-container .row-five .box-body .box-item:nth-child(5n){margin-right:0}
  .main-container .row-five .box-body .box-item .item-link{height:210px}
  .content-box{width:1000px;margin:0 auto;background:#fff;min-height:500px;border-radius:5px;padding:15px;box-sizing:border-box;overflow:hidden}
  .content-box .breadcrumb{height:24px;line-height:24px;background:#FFF;padding:0;margin-bottom:15px;border-radius:0;color:#777;overflow:hidden}
  .content-box .breadcrumb a{color:#337ab7}
  .content-row{overflow:hidden}
  .content-row .cont-l{float:left}
  .content-row .cont-l .con-pic{width:220px;float:left}
  .content-row .cont-l .con-pic img{display:inline-block;width:100%;height:300px;background-color:#fff;border:1px solid #ddd;padding:1px;box-sizing:border-box}
  .content-row .cont-l .con-dete{float:right;width:720px;font-size:12px}
  .content-row .cont-l .con-dete .con-detail{border-left:1px solid #ddd;border-right:1px solid #ddd;border-bottom:1px solid #ddd;box-sizing:border-box;margin-bottom:10px}
  .content-row .cont-l .con-dete .con-detail ul{width:100%;box-sizing:border-box;overflow:hidden;border-top:1px solid #ddd}
  .content-row .cont-l .con-dete .con-detail ul:nth-of-type(odd){background-color:#f9f9f9}
  .content-row .cont-l .con-dete .con-detail ul li{float:left;padding:5px;box-sizing:border-box}
  .content-row .cont-l .con-dete .con-detail ul li.li-l{width:80px}
  .content-row .cont-l .con-dete .con-detail ul li.li-l .info-label{color:#777;font-weight:bold}
  .content-row .cont-l .con-dete .con-detail ul li.li-r{width:calc(100% - 80px);margin-left:-1px;border-left:1px solid #ddd;color:#333}
  .content-row .cont-l .con-des{float:right;width:720px;border:1px solid #ddd}
  .content-row .cont-l .con-des .summary{margin:5px;color:#333;line-height:24px}
  .play-list{overflow:hidden}
  .panel{margin-bottom:20px;background-color:#fff;border:1px solid transparent;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.05);border-color:#ddd}
  .panel .panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;color:#333;background-color:#f5f5f5;border-color:#ddd}
  .dslist-group{margin-top:5px;margin-left:4px;padding-left:0;margin-bottom:5px;overflow:hidden}
  .dslist-group li{word-break:keep-all;overflow:hidden;padding:8px 1px;text-overflow:ellipsis;white-space:nowrap;float:left}
  .dslist-group li a{background-color:#e6e6e6;border-color:#e6e6e6;color:#444;margin:3px;padding:5px 12px 5px 10px;text-decoration:none;transition:background .2s}
  .dslist-group li a:hover{background-color:#d0d0d0}
  .panel-footer{clear:both;background-color:#f5f5f5;border-top:1px solid #ddd;border-bottom-right-radius:3px;border-bottom-left-radius:3px;padding:8px 10px;color:#777}
  .pagenav{text-align:center}
  .pagination{display:inline-block;padding-left:0;margin:10px 0;border-radius:4px}
  .pagination li{display:inline}
  .pagination a,.pagination span,.pagination em{position:relative;float:left;padding:8px 25px;margin-left:-1px;line-height:1.42857143;font-size:17px;color:#8B8B8B;text-decoration:none;background-color:#fff;border:1px solid #ddd;transition:background .2s}
  .pagination a:hover{background-color:#f5f5f5;color:#333}
  .empty-tip{text-align:center;padding:60px 20px;color:#999;font-size:16px}
  footer{font-size:12px;border-top:1px solid #DDD;text-align:center;margin-top:25px;padding:20px 10px;color:#666;background-color:#EEE}
  footer p{margin:0 0 10px}
}

@media screen and (max-width:768px){
  header{margin-bottom:5px}
  header .head{height:45px;background:#09C878}
  header .head .logo{float:left;width:120px;height:42px;overflow:hidden;font-size:18px;font-weight:bold;color:#fff;line-height:45px;padding-left:10px}
  header .head .logo a{color:#fff;text-decoration:none}
  header .head .api-select{float:left;width:auto;margin-top:8px}
  header .head .api-select select{min-width:70px;padding:3px 5px;border:1px solid #F5F5F5;border-radius:4px;background:#F5F5F5;font-size:12px;color:#333;cursor:pointer}
  header .head .search-box{width:40%;max-width:768px;height:30px;float:right;margin-top:8px;border-radius:4px;z-index:98}
  header .head .search-box form{overflow:hidden;position:relative}
  header .head .search-box .search-input{width:calc(100% - 38px);height:28px;line-height:28px;font-size:14px;color:#999;text-indent:9px;border:1px solid #F5F5F5;background-color:#F5F5F5;border-radius:4px 0 0 4px}
  header .head .search-box .search-button{width:38px;margin-right:10px;height:30px;line-height:30px;border:0;color:#fff;font-size:12px;border-radius:0 4px 4px 0;background-color:#398439;position:absolute;right:0;top:0}
  .navbar{width:100%;margin:0 auto;background:rgba(254,254,254,.97);height:37px;box-sizing:border-box;text-align:center;border-bottom:1px solid #ccc}
  header .navbar .nav-container{height:37px;overflow:auto;-webkit-overflow-scrolling:touch}
  header .navbar .nav-container ul.menu{white-space:nowrap;float:left;margin:0}
  header .navbar .nav-container ul.menu li{display:inline;height:37px;line-height:37px;white-space:nowrap}
  header .navbar .nav-container ul.menu li a{font-size:15px;height:100%;color:#333;padding:9px 12px}
  .main-container{width:100%;margin:0 auto;min-height:500px}
  .main-container .box-title{height:24px;line-height:24px;padding:10px 5px}
  .main-container .box-title b{display:block;float:left;height:24px;line-height:24px;padding-left:10px;border-left:8px solid #00A6DE;color:#444;font-size:20px;font-weight:400}
  .main-container .box-body .box-item{float:left;border-radius:3px;background:#FFF;overflow:hidden;box-sizing:border-box;transition:box-shadow .3s ease}
  .main-container .box-body .box-item:hover{box-shadow:2px 2px 10px #CCC}
  .main-container .box-body .box-item .item-link{position:relative;display:block;width:100%;overflow:hidden}
  .main-container .box-body .box-item .item-link img{border:1px solid #ccc;padding:1px;width:100%;height:100%;box-sizing:border-box}
  .main-container .box-body .box-item .item-link .hdtag{background:#09C878;padding:2px 5px;color:#FFF;font-size:12px;right:2px;bottom:2px;position:absolute;border:none}
  .main-container .box-body .box-item .meta{margin-top:5px}
  .main-container .box-body .box-item .meta .item-name{width:100%;overflow:hidden;height:20px}
  .main-container .box-body .box-item .meta .item-name a{font-size:14px;color:#333;text-overflow:ellipsis;white-space:nowrap;width:100%;overflow:hidden;display:inline;float:left}
  .main-container .box-body .box-item .meta em{font-size:0}
  .main-container .box-body .box-item .meta em span{font-size:12px;color:#8c8c8c}
  .main-container .box-body .box-item .meta em strong span{color:#FF0000}
  .main-container .row-five{overflow:hidden;margin-bottom:10px}
  .main-container .box-body{overflow:hidden;padding:0 5px}
  .main-container .box-body .box-item{width:32%;margin-right:2%;margin-bottom:10px;padding:4px}
  .main-container .box-body .box-item:nth-child(3n){margin-right:0}
  .main-container .box-body .box-item .item-link{height:150px}
  .content-box{width:100%;margin:0 auto;background:#fff;min-height:500px;border-radius:5px;padding:5px;box-sizing:border-box;overflow:hidden;border-top:1px solid #eee}
  .content-box .breadcrumb{height:24px;line-height:24px;padding:0;margin-bottom:10px;border-radius:0;color:#777;overflow:hidden}
  .content-box .breadcrumb a{color:#337ab7}
  .content-row{overflow:hidden}
  .content-row .cont-l{float:left;width:100%}
  .content-row .cont-l .con-pic{width:110px;float:left}
  .content-row .cont-l .con-pic img{display:inline-block;max-width:100%;height:163px;background-color:#fff;border:1px solid #ddd;padding:1px;box-sizing:border-box}
  .content-row .cont-l .con-dete{float:right;width:calc(100% - 115px);font-size:12px}
  .content-row .cont-l .con-dete .con-detail{border-left:1px solid #ddd;border-right:1px solid #ddd;border-bottom:1px solid #ddd;box-sizing:border-box;margin-bottom:10px}
  .content-row .cont-l .con-dete .con-detail ul{width:100%;box-sizing:border-box;overflow:hidden;border-top:1px solid #ddd}
  .content-row .cont-l .con-dete .con-detail ul:nth-of-type(odd){background-color:#f9f9f9}
  .content-row .cont-l .con-dete .con-detail ul li{float:left;padding:5px;box-sizing:border-box}
  .content-row .cont-l .con-dete .con-detail ul li.li-l{width:60px}
  .content-row .cont-l .con-dete .con-detail ul li.li-l .info-label{color:#777;font-weight:bold}
  .content-row .cont-l .con-dete .con-detail ul li.li-r{width:calc(100% - 80px);margin-left:-1px;border-left:1px solid #ddd;color:#333}
  .content-row .cont-l .con-des{float:left;margin-top:10px;border:1px solid #ddd}
  .content-row .cont-l .con-des .summary{margin:5px;color:#333;font-size:14px;line-height:24px}
  .play-list{overflow:hidden}
  .panel{margin-bottom:20px;background-color:#fff;border:1px solid transparent;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.05);border-color:#ddd}
  .panel .panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;color:#333;background-color:#f5f5f5;border-color:#ddd}
  .dslist-group{margin-top:5px;margin-left:4px;padding-left:0;margin-bottom:5px;overflow:hidden}
  .dslist-group li{word-break:keep-all;overflow:hidden;padding:8px 1px;text-overflow:ellipsis;white-space:nowrap;float:left}
  .dslist-group li a{background-color:#e6e6e6;border-color:#e6e6e6;color:#444;margin:3px;padding:5px 12px 5px 10px;text-decoration:none}
  .panel-footer{clear:both;background-color:#f5f5f5;border-top:1px solid #ddd;border-bottom-right-radius:3px;border-bottom-left-radius:3px;padding:8px 10px;color:#777}
  .pagenav{text-align:center}
  .pagination{display:inline-block;padding-left:0;margin:20px 0;border-radius:4px}
  .pagination li{display:inline}
  .pagination li a,.pagination li span{position:relative;float:left;padding:8px 18px;margin-left:-1px;line-height:1.42857143;color:#8B8B8B;text-decoration:none;background-color:#fff;border:1px solid #ddd}
  .pagination li:first-child a,.pagination li:first-child span{margin-left:0;border-top-left-radius:4px;border-bottom-left-radius:4px}
  .pagination li:last-child a,.pagination li:last-child span{border-top-right-radius:4px;border-bottom-right-radius:4px}
  .empty-tip{text-align:center;padding:40px 10px;color:#999;font-size:14px}
  footer{font-size:12px;border-top:1px solid #DDD;text-align:center;margin-top:15px;padding:15px 10px;color:#666;background-color:#EEE}
  footer p{margin:0 0 10px}
  .mbnone{display:none !important}
}

@media screen and (max-width:320px){
  .pagination li a,.pagination li span{padding:6px 14px}
}
`;

export default Layout;
