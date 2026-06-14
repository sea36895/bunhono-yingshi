import type { FC } from "hono/jsx";
import type { PageContext, Video } from "../../index";

interface SearchProps {
  ctx: PageContext;
}

const Search: FC<SearchProps> = ({ ctx }) => {
  const videos = ctx.videoData;

  return (
    <section class="main-container">
      <div class="row-five">
        <div class="box-title">
          <b>{ctx.searchKeyword}的搜索结果</b>
        </div>
        <div class="box-body">
          {videos.length === 0 ? (
            <div class="empty-tip">未找到"{ctx.searchKeyword}"相关资源，请换个关键词试试</div>
          ) : (
            videos.map((video: Video) => (
              <div class="box-item">
                <a
                  class="item-link"
                  href={`${ctx.baseUrl}?info=${video.id}`}
                  title={video.name ?? ""}
                >
                  <img
                    src={video.pic || "https://placehold.co/200x280?text=No+Image"}
                    alt={video.name ?? ""}
                  />
                  <span class="hdtag">{video.type || "未知"}</span>
                </a>
                <div class="meta">
                  <div class="item-name">
                    <a
                      title={video.name ?? ""}
                      href={`${ctx.baseUrl}?info=${video.id}`}
                    >
                      {video.name || "未知"}
                    </a>
                  </div>
                  <em>
                    更新：
                    <strong>
                      <span>{video.last || "未知"}</span>
                    </strong>
                  </em>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {videos.length > 0 && (
        <div class="pagenav">
          <ul class="pagination">
            <a target="_self" href={ctx.pagination.firstUrl}>首页</a>
            &nbsp;
            <a target="_self" href={ctx.pagination.prevUrl}>上一页</a>
            &nbsp;
            <span class="page-info">
              {ctx.pagination.current}/{ctx.pagination.last}
            </span>
            &nbsp;
            <a target="_self" href={ctx.pagination.nextUrl}>下一页</a>
            &nbsp;
            <a target="_self" href={ctx.pagination.lastUrl}>尾页</a>
          </ul>
        </div>
      )}
    </section>
  );
};

export default Search;
