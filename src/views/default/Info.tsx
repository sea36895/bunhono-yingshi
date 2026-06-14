import type { FC } from "hono/jsx";
import type { PageContext, Video, DdItem } from "../../index";

interface InfoProps {
  ctx: PageContext;
}

function generatePlayerScript(videoInfo: Video, videoParser: string): string {
  let dlData = videoInfo.dl?.dd;
  let selectedDd: string | null = null;

  if (dlData) {
    if (Array.isArray(dlData)) {
      for (const dd of dlData) {
        if (typeof dd === "string") {
          if (dd.toLowerCase().includes("m3u8")) {
            selectedDd = dd;
            break;
          }
        } else if (dd && typeof dd === "object") {
          const flag: string = dd["@flag"] || "";
          const textContent: string = dd["#text"] || "";
          if (
            flag.toLowerCase().includes("m3u8") ||
            textContent.toLowerCase().includes("m3u8")
          ) {
            selectedDd = textContent;
            break;
          }
        }
      }
      if (!selectedDd) {
        const firstDd = dlData[0] as DdItem | undefined;
        if (firstDd) {
          if (typeof firstDd === "string") {
            selectedDd = firstDd;
          } else if (typeof firstDd === "object") {
            selectedDd = firstDd["#text"] || "";
          }
        }
      }
    } else if (typeof dlData === "object") {
      selectedDd = (dlData as Record<string, string>)["#text"] || "";
    } else if (typeof dlData === "string") {
      selectedDd = dlData;
    }
  }

  // 对嵌入 JSON 的数据做 HTML 安全转义，防止 XSS
  const safeJson = JSON.stringify({ dd: selectedDd }).replace(
    /<\/script/gi,
    "<\\/script",
  );
  const safeParser = videoParser.replace(/<\/script/gi, "<\\/script");

  return `
document.addEventListener("DOMContentLoaded",function(){
  var bflist=${safeJson},jx="${safeParser}";
  window.bf=function(str){
    var iframe=document.getElementById("iframe"),frame=document.getElementById("frame");
    if(iframe&&frame){iframe.style.display="block";frame.src=jx+encodeURIComponent(str);}
  };
  var playlist=document.getElementById("playlist");
  if(!playlist)return;
  var ddData=bflist.dd;
  if(!ddData){playlist.innerHTML='<div class="panel"><div class="panel-heading"><strong>暂无播放资源</strong></div><div class="panel-body">数据解析失败</div></div>';return;}
  var viddz=ddData.split("#");
  if(!viddz.length||!viddz[0]){playlist.innerHTML='<div class="panel"><div class="panel-heading"><strong>暂无播放资源</strong></div><div class="panel-body">视频列表为空</div></div>';return;}
  var bfmoban=playlist.innerHTML;playlist.innerHTML="";
  var hasValidData=false;
  for(var i=0;i<viddz.length;i++){
    var ddItem=viddz[i];
    if(!ddItem||typeof ddItem!=="string")continue;
    hasValidData=true;
    var info=ddItem.split("$"),zyname=info[2]||"yun",epName=info[0]||"未知剧集",epUrl=info[1]||"";
    if(i===0){
      var panelHtml=bfmoban.replace(/资源加载中/g,zyname);
      panelHtml=panelHtml.replace(/剧集地址加载中/g,epUrl);
      panelHtml=panelHtml.replace(/剧集加载中/g,epName);
      playlist.innerHTML+=panelHtml;
    }else{
      var zylxDiv=document.getElementById("zylx"+zyname);
      if(zylxDiv){zylxDiv.innerHTML+='<li><a href="#iframe" target="_self" onclick="bf(\\''+epUrl+'\\')">'+epName+"</a></li>";}
    }
  }
  if(!hasValidData){playlist.innerHTML='<div class="panel"><div class="panel-heading"><strong>暂无播放资源</strong></div><div class="panel-body">无法解析有效的播放数据</div></div>';}
});`;
}

const Info: FC<InfoProps> = ({ ctx }) => {
  const video = ctx.videoInfo || ({} as Video);
  const playerScript = video.dl
    ? generatePlayerScript(video, ctx.videoParser)
    : "";

  return (
    <>
      <section class="content-box">
        <div class="breadcrumb">
          <a href={ctx.baseUrl}>首页</a>
          &nbsp;&raquo;&nbsp;
          <a href={`${ctx.baseUrl}?sort=${video.tid || ""}`}>
            {video.type || "未知"}
          </a>
          &nbsp;&raquo;&nbsp;
          {video.name || "未知"}
        </div>
        <div class="content-row">
          <div class="cont-l">
            <div class="con-pic">
              <img
                class="img-thumbnail"
                alt={video.name ?? ""}
                src={
                  video.pic ||
                  "https://placehold.co/200x280?text=No+Image"
                }
              />
            </div>
            <div class="con-dete">
              <div class="con-detail">
                <ul>
                  <li class="li-l">
                    <span class="info-label">片名</span>
                  </li>
                  <li class="li-r">{video.name || "未知"}</li>
                </ul>
                <ul>
                  <li class="li-l">
                    <span class="info-label">导演</span>
                  </li>
                  <li class="li-r">{video.director || "未知"}</li>
                </ul>
                <ul>
                  <li class="li-l">
                    <span class="info-label">主演</span>
                  </li>
                  <li class="li-r">{video.actor || "未知"}</li>
                </ul>
                <ul>
                  <li class="li-l">
                    <span class="info-label">类型</span>
                  </li>
                  <li class="li-r">{video.type || "未知"}</li>
                </ul>
                <ul>
                  <li class="li-l">
                    <span class="info-label">地区</span>
                  </li>
                  <li class="li-r">{video.area || "未知"}</li>
                </ul>
                <ul>
                  <li class="li-l">
                    <span class="info-label">更新时间</span>
                  </li>
                  <li class="li-r">{video.last || "未知"}</li>
                </ul>
              </div>
            </div>
            <div class="con-des">
              <p>
                <strong>剧情介绍：</strong>
              </p>
              <p class="summary">{video.des || "暂无描述"}</p>
            </div>
          </div>
        </div>
        <div class="panel" id="iframe" style="display:none">
          <iframe
            src=""
            width="100%"
            height="400px"
            frameborder="0"
            border="0"
            marginwidth="0"
            marginheight="0"
            scrolling="no"
            allowFullScreen={true}
            id="frame"
          ></iframe>
        </div>
        <div class="play-list" id="playlist">
          <div class="panel">
            <div class="panel-heading">
              <strong>
                <span class="mbnone">
                  《{video.name || "未知"}》 -{" "}
                </span>
                资源加载中：
              </strong>
            </div>
            <ul class="dslist-group" id="zylx资源加载中">
              <li>
                <a
                  href="#iframe"
                  target="_self"
                  onclick="bf('剧集地址加载中')"
                >
                  剧集加载中
                </a>
              </li>
            </ul>
            <div class="panel-footer">
              <strong>
                《{video.name || "未知"}》 -
                资源加载中资源观看帮助：
              </strong>
              <br />
              1、有个别电影打开后播放需要等待。
              <br />
              2、有的播放不了请多刷新几下，试试。
              <br />
            </div>
          </div>
        </div>
      </section>
      {playerScript && (
        <script dangerouslySetInnerHTML={{ __html: playerScript }} />
      )}
    </>
  );
};

export default Info;
