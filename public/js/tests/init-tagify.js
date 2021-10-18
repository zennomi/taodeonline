var testTagLists =[
    {value: "Kiểm tra 15 phút", searchKeys: "15p"},
    {value: "Kiểm tra cuối chương", searchKeys: "ktcc"},
    {value: "Kiểm tra đầu vào", searchKeys: "ktdv"},
    {value: "Luyện đề", searchKeys: "ld"},
    {value: "Kiểm tra bù", searchKeys: "ktb bu"},
    {value: "Kiểm tra chuyên đề", searchKeys: "ktcd cd"},
    {value: "Đề livestream", searchKeys: "live"},
    {value: "Ôn thi giữa kì", searchKeys: "gk"},
    {value: "Ôn thi cuối kì", searchKeys: "ck"},
    {value: "Thi thử", searchKeys: "tt"},
    {value: "Khóa học", searchKeys: "kh khoa hoc"},
    {value: "Ôn tập", searchKeys: "on tap"},
    {value: "Lý thuyết", searchKeys: "lt"},
    {value: "Kiểm tra chất lượng", searchKeys: "ktcl"},
    {value: "Lớp 7+", searchKeys: "7+"},
    {value: "Lớp 8+", searchKeys: "8+"},
    {value: "Lớp 9+", searchKeys: "9+"},
    {value: "Đề thi thật", searchKeys: "De thi that dtt dethi"},
    {value: "Đề tốc độ", searchKeys: "de toc do dtd td"},
]

var testTagifyOptions = {
    enforceWhitelist: true,
    whitelist: testTagLists,
    maxTags: 10,
    dropdown: {
      searchKeys: ["value", "searchKeys"],
      maxItems: 20,           // <- mixumum allowed rendered suggestions
      classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
      enabled: 0,             // <- show suggestions on focus
      closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
    }
  };
  
  
  
  document.querySelectorAll('.test-tagify').forEach(e => {return new Tagify(e, testTagifyOptions)});