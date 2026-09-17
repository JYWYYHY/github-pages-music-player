/**************************************************
 * GithubMusicPlayer v3.0
 * 数据交互模块（纯静态版）
 *
 * 说明：原版通过 api.php 走后端搜索/取链接，
 *       部署到 GitHub Pages 后无后端，已全部改为本地逻辑。
 *************************************************/


// 完善获取音乐信息
// 本地音乐一般在 json 里已有 url，直接回调
function ajaxUrl(music, callback) {
    // 已有 url，直接用
    if (music.url !== null && music.url !== "err" && music.url !== "") {
        callback(music);
        return true;
    }

    // 没有 url（本地文件丢失或未配置），标记为错误
    music.url = "err";
    updateMinfo(music);
    callback(music);
    return true;
}


// 完善获取音乐封面图
// 本地音乐一般在 json 里已有 pic，直接回调
function ajaxPic(music, callback) {
    // 已有 pic，直接用
    if (music.pic !== null && music.pic !== "err" && music.pic !== "") {
        callback(music);
        return true;
    }

    // 没有 pic，标记为错误
    music.pic = "err";
    updateMinfo(music);
    callback(music);
    return true;
}


// 加载本地歌单
// 参数：歌单 id, 歌单存储 id，回调函数
function loadLocalMusicList(lid, id, callback) {
    if (!lid) return false;

    // 已经在加载了，跳过
    if (musicList[id].isloading === true) {
        return true;
    }
    musicList[id].isloading = true;

    $.ajax({
        type: mkPlayer.method,
        url: mkPlayer.githubAPI,
        dataType: "json",
        timeout: 15000,
        complete: function () {
            musicList[id].isloading = false;
        },
        success: function (data) {
            // ① 结构校验
            if (!Array.isArray(data) || !data[0]) {
                console.error('歌单 json 结构不对，期望 [ {...} ]，实际：', data);
                layer.msg('歌单文件格式错误，请检查 static/music_list_*.json', { icon: 2, time: 3000 });
                $(".sheet-item[data-no='" + id + "'] .sheet-name").html('<span style="color: #EA8383">格式错误</span>');
                return;
            }

            var jsonData = data[0];

            // ② 校验 item
            if (!Array.isArray(jsonData.item)) {
                console.error('歌单缺少 item 数组：', jsonData);
                layer.msg('歌单内容为空或格式错误', { icon: 2, time: 3000 });
                $(".sheet-item[data-no='" + id + "'] .sheet-name").html('<span style="color: #EA8383">格式错误</span>');
                return;
            }

            // 存储歌单信息
            var tempList = {
                id: lid,
                name: jsonData.name || musicList[id].name,
                cover: jsonData.cover,
                creatorName: jsonData.creatorName,
                creatorAvatar: jsonData.creatorAvatar,
                item: []
            };

            if (jsonData.cover !== '') {
                tempList.cover = jsonData.cover + "?param=200y200";
            } else {
                tempList.cover = musicList[id].cover;
            }

            // 存储歌单中的音乐信息
            for (var i = 0; i < jsonData.item.length; i++) {
                tempList.item[i] = {
                    id: jsonData.item[i].id,
                    name: jsonData.item[i].name,
                    artist: jsonData.item[i].artist,
                    album: jsonData.item[i].album,
                    source: jsonData.item[i].source,
                    url_id: jsonData.item[i].url_id,
                    pic_id: jsonData.item[i].pic_id,
                    lyric_id: jsonData.item[i].lyric_id,
                    pic: jsonData.item[i].pic ? (jsonData.item[i].pic + "?param=300y300") : "",
                    url: jsonData.item[i].url,
                    lyric: jsonData.item[i].lyric
                };
            }

            // 存储列表信息
            musicList[id] = tempList;

            if (id == mkPlayer.defaultlist) loadList(id);
            if (callback) callback(id);

            // 改变前端列表
            $(".sheet-item[data-no='" + id + "'] .sheet-cover").attr('src', tempList.cover);
            $(".sheet-item[data-no='" + id + "'] .sheet-name").html(tempList.name);

            if (mkPlayer.debug) {
                console.debug("歌单 [" + tempList.name + "] 中的音乐获取成功，共 " + tempList.item.length + " 首");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var msg;
            if (textStatus === 'timeout') {
                msg = '歌单加载超时，请检查网络';
            } else if (XMLHttpRequest.status === 404) {
                msg = '歌单文件不存在，请检查 static/music_list_*.json 是否已上传';
            } else if (XMLHttpRequest.status === 0) {
                msg = '歌单加载失败，可能是网络问题';
            } else {
                msg = '歌单读取失败 (' + XMLHttpRequest.status + ')';
            }
            hideLoading();   // 加载失败也要关掉遮罩，让用户能看到错误
            layer.msg(msg, { icon: 2, time: 4000 });
            console.error('[loadLocalMusicList]', textStatus, errorThrown, XMLHttpRequest);
            $(".sheet-item[data-no='" + id + "'] .sheet-name").html('<span style="color: #EA8383">读取失败</span>');
        }
    });
}


// 加载本地歌词
// 参数：音乐信息，回调函数
function loadLocalLyric(music, callback) {
    lyricTip('歌词加载中...');

    if (music.lyric_id) {
        callback(music.lyric, music.lyric_id);
    } else {
        lyricTip('暂无歌词');
    }
}