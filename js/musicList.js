/**************************************************
 * GithubMusicPlayer v3.0
 * 播放列表配置模块
 *************************************************/
// 建议修改前先备份一下
// js/player.js 中开启调试模式，然后按 F12 打开浏览器的控制台。播放歌曲或点开歌单即可看到相应信息

var musicList = [
    // 以下三个系统预留列表请勿更改，否则可能导致程序无法正常运行！
    // 预留列表：搜索结果
    {
        id: "0",
        name: "搜索结果",   // 播放列表名字
        cover: "",          // 播放列表封面
        creatorName: "",        // 列表创建者名字
        creatorAvatar: "",      // 列表创建者头像
        item: [

        ]
    },
    // 预留列表：正在播放
    {
        id: "1",
        name: "正在播放",   // 播放列表名字
        cover: "images/album.png",          // 播放列表封面
        creatorName: "",        // 列表创建者名字
        creatorAvatar: "",      // 列表创建者头像
        item: [

        ]
    },
    // 预留列表：播放历史
    {
        /* 可以手动维护这个歌单，然后再把它自动生成就好了，其他功能用到再调 */
        id: "2",
        name: "播放历史",   // 播放列表名字
        cover: "images/history.png",          // 播放列表封面
        creatorName: "",        // 列表创建者名字
        creatorAvatar: "",      // 列表创建者头像
        item: [

        ]
    },
    // 收藏列表：用户收藏的歌曲
    {
        id: "favorites",
        name: "我的收藏",   // 播放列表名字
        cover: "images/favorites.png",          // 播放列表封面（使用不同的图标）
        creatorName: "",        // 列表创建者名字
        creatorAvatar: "",      // 列表创建者头像
        item: [

        ]
    },
    // 以上四个系统预留列表请勿更改，否则可能导致程序无法正常运行！
    //*********************************************
    // 自定义列表
    // 注意：这里的元信息（id / name / cover）是"占位配置"，
    //       实际歌曲数据由 static/music_list_*.json 提供，
    //       通过 ajax.js 的 loadLocalMusicList() 按 id 匹配加载。
    //       所以 id 必须和 json 里的 id 一致，不要随便改。
    {
        id: "9527",                    // 必须与 json 里的 id 一致
        name: "Github 歌单",            // 加载前的占位名，json 加载后会覆盖
        cover: "images/album.png",     // 加载前的占位封面，json 加载后会覆盖
        creatorName: "EXP",
        creatorAvatar: "EXP",
        item: []                       // 留空，由 loadLocalMusicList 填充
    }
];