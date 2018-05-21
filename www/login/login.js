'use strict';

$(window).load(function () {
  var setCookie = function (name, value, expired) {
    var today = new Date();
    today.setDate(today.getDate() + expired);

    var ck = name + '=' + escape(value);
    ck += '; path=/; expires=';
    ck += today.toGMTString() + ';';
    document.cookie = ck;
  }

  var saveUserId = function () {
    var idChecked = $('.login_form_user-id_cache').is(':checked');
    var userid = $('.login_form_user-id_input').val();

    if (idChecked) {
      setCookie('userid', userid, 7);
    } else {
      setCookie('userid', userid, -1);
    }
  }

  var getLogin = function () {
    var cook = document.cookie + ';';
    var userIdIndex = cook.indexOf('userid', 0);
    var value;
    var begin;
    var end;

    if (userIdIndex != -1) {
      cook = cook.substring(userIdIndex, cook.length);
      begin = cook.indexOf('=', 0) + 1;
      end = cook.indexOf(';', begin);
      value = unescape(cook.substring(begin, end));
    }

    if (value) {
      document.querySelector('.login_form_user-id_input').value = value;
      document.querySelector('.login_form_user-id_cache').checked = true;

      $('.login_form_passwd_input').focus();
    } else {
    $('.login_form_user-id_input').focus();
    }
  }

  var getParam = function (name) {
    var regex = new RegExp('[\\#&?]' + name + '=([^&#]*)');
    var hash = regex.exec(location.href);
    if (hash) {
      return hash[1];
    } else {
      return '';
    }
  }

  // 대시보드로 부터 redirect될시 sid와 url 해시 데이터를 가지고 있다.
  var sid = getParam('sid');
  var url = getParam('url');
  var hash = location.hash;

  if (sid && url) {
    $.getJSON('/Login?sid=' + sid, function (res) {
      if (res.islogin === 'true') {
        location.href = url + hash;
      }
    });
  }

  getLogin();

  var doPost = function (uid, upass, $uidBox, $upassBox) {
    $.post('/Login', {
      id: uid,
      passwd: upass
    }, function (res) {
      if(res.response.islogin) {
        saveUserId();
        window.location.href = '/RTM/view.html';
      } else {
        $upassBox.after('<span class="login_form_error-msg">' + res.response.error + '</span>');
      }
    });
  };

  $('.login_form_submit').click(function (e) {
    $('.login_form_error-msg').slideUp(400, function () {
      $(this).remove();
    });
    e.preventDefault();

    var $useridInput = $('.login_form_user-id_input');
    var $passwdInput = $('.login_form_passwd_input');
    var uid = $useridInput.val().trim();
    var upass = $passwdInput.val();

    if (uid === '') {
      $useridInput.after('<span class="login_form_error-msg">Please insert Login ID</span>');
      $useridInput.on('focus', function () {
        $('.login_form_error-msg').slideUp(400, function () {
          $(this).remove();
        });
      });
    } else if (upass === '') {
      $passwdInput.after('<span class="login_form_error-msg">Please insert Password</span>');
      $passwdInput.on('focus', function () {
        $('.login_form_error-msg').slideUp(400, function () {
          $(this).remove();
        });
      });
    } else {
      doPost(uid, upass, $useridInput, $passwdInput);
    }
  });
});
