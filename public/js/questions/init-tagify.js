var tagLists = [
    {value: "Dao Động Cơ", grade: 12, searchKeys: "dđc, dđđh"},
    {value: "Dao Động Điều hòa", grade: 12, searchKeys: "dđc dđđh ddc dddh"},
    {value: "Dao động tắt dần", grade: 12, searchKeys: ""},
    {value: "Dao động cưỡng bức", grade: 12, searchKeys: ""},
    {value: "Dao Động Điều hòa", grade: 12, searchKeys: ""},
    {value: "Con Lắc Lò Xo", grade: 12, searchKeys: "cllx cl lx"},
    {value: "Con Lắc Đơn", grade: 12, searchKeys: "cl clđ cld"},
    {value: "Tổng hợp Dao Động", grade: 12, searchKeys: "thdd"},
    {value: "Các Loại Dao Động", grade: 12, searchKeys: "cldd cldđ"},
    {value: "Phương Trình Dao Động", grade: 12, searchKeys: "ptdd ptdđ"},
    {value: "Sóng Cơ Và Sóng Âm", grade: 12, searchKeys: "sc sa"},
    {value: "Sóng Cơ", grade: 12, searchKeys: "sc"},
    {value: "Giao thoa sóng", grade: 12, searchKeys: ""},
    {value: "Sóng dừng", grade: 12, searchKeys: ""},
    {value: "Sóng Âm", grade: 12, searchKeys: "sa"},
    {value: "Dòng điện xoay chiều", grade: 12, searchKeys: "xc đxc"},
    {value: "Máy biến áp", grade: 12, searchKeys: ""},
    {value: "Mạch điện xoay chiều", grade: 12, searchKeys: "đxc dxc"},
    {value: "RLC mắc nối tiếp", grade: 12, searchKeys: ""},
    {value: "Hệ số công suất", grade: 12, searchKeys: ""},
    {value: "Truyền tải điện năng", grade: 12, searchKeys: ""},
    {value: "Máy phát điện xoay chiều", grade: 12, searchKeys: ""},
    {value: "Động cơ không đồng bộ ba pha", grade: 12, searchKeys: ""},
    {value: "Mạch dao động", grade: 12, searchKeys: ""},
    {value: "Điện từ trường", grade: 12, searchKeys: ""},
    {value: "Giao thoa ánh sáng", grade: 12, searchKeys: ""},
    {value: "Sóng Điện Từ", grade: 12, searchKeys: "sđt sdt"},
    {value: "Dao động và Sóng Điện Từ", grade: 12, searchKeys: "sđt sdt"},
    {value: "Sóng Ánh Sáng", grade: 12, searchKeys: "sas"},
    {value: "Các loại quang phổ", grade: 12, searchKeys: ""},
    {value: "Tia tử ngoại", grade: 12, searchKeys: ""},
    {value: "Tia hồng ngoại", grade: 12, searchKeys: ""},
    {value: "Tia X", grade: 12, searchKeys: ""},
    {value: "Thuyết lượng tử ánh sáng", grade: 12, searchKeys: ""},
    {value: "Hiện tượng quang điện trong", grade: 12, searchKeys: ""},
    {value: "Hiện tượng quang – phát quang", grade: 12, searchKeys: ""},
    {value: "Điện Tích. Điện Trường", grade: 11, searchKeys: ""},
    {value: "Điện Tích", grade: 11, searchKeys: ""},
    {value: "Định Luật Cu-lông", grade: 11, searchKeys: ""},
    {value: "Thuyết Electron", grade: 11, searchKeys: "êlectron"},
    {value: "Định Luật Bảo Toàn Điện Tích", grade: 11, searchKeys: ""},
    {value: "Điện Cường. Cường Độ Điện Trường", grade: 11, searchKeys: ""},
    {value: "Đường Sức Điện", grade: 11, searchKeys: ""},
    {value: "Công của lực điện", grade: 11, searchKeys: ""},
    {value: "Điện Thế. Hiệu Điện Thế", grade: 11, searchKeys: ""},
    {value: "Tụ Điện", grade: 11, searchKeys: ""},
    {value: "Từ Trường", grade: 11, searchKeys: ""},
    {value: "Bẫy lý thuyết", searchKeys: ""},
    {value: "Bẫy ngôn từ", searchKeys: ""},
];

var tagifyOptions = {
    enforceWhitelist: true,
    whitelist: tagLists,
    maxTags: 10,
    dropdown: {
        searchKeys: ["value", "searchKeys"],
      maxItems: 20,           // <- mixumum allowed rendered suggestions
      classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
      enabled: 0,             // <- show suggestions on focus
      closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
    }
  };

document.querySelectorAll('.tagify').forEach(e => {return new Tagify(e, tagifyOptions)})