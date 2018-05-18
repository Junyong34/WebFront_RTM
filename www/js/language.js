
// ExtJS Language Setting
var useLanguage = exem.so().lang;

if ('ko' === useLanguage) {
    // Korean
    Ext.Loader.loadScript('/js/extjs/locale/ext-lang-ko.js');

} else if ('jp' === useLanguage) {
    // Japanese
    Ext.Loader.loadScript('/js/extjs/locale/ext-lang-ja.js');

} else {
    // English
    Ext.Loader.loadScript('/js/extjs/locale/ext-lang-en.js');
}

