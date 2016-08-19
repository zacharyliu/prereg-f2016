(function () {
  function SubscribeForm($form) {
    this._$form = $form;
    this._$input = $form.find('input[type="email"]');
    this._$button = $form.find('button[type="submit"]');
    this._$icon = this._$button.find('i');
    this._$text = $form.find('p');
    this._currentState = 'ready';

    $form.submit(this._onSubmit.bind(this));
    $form.keyup(this._onKeyup.bind(this));
  }

  SubscribeForm.prototype._onSubmit = function (e) {
    e.preventDefault();

    this.setState('loading');

    var url = this._$form.attr('action').replace('/post?', '/post-json?').concat('&c=?');
    var _this = this;

    $.getJSON(url, {
      'EMAIL': this._$input.val()
    }).then(function (data, textStatus, jqXHR) {
      if (textStatus != 'success'
        || !data
        || data.result !== 'success') return $.Deferred().reject().promise();
      _this.setState('success');
    }).fail(function () {
      _this._$input.shake({times: 2, speed: 60});
      _this.setState('error');
    });
  };
  SubscribeForm.prototype._onKeyup = function (e) {
    if (this._currentState == 'error') {
      this.setState('ready');
    }

    if (this._$input.val().length > 0) {
      this._$form.addClass('subscribe-form--has-text');
    } else {
      this._$form.removeClass('subscribe-form--has-text');
    }
  };
  SubscribeForm.prototype._setDisabled = function (isDisabled) {
    if (isDisabled) {
      this._$input.attr('disabled', '');
      this._$button.attr('disabled', '');
    } else {
      this._$input.removeAttr('disabled');
      this._$button.removeAttr('disabled');
    }
  };
  SubscribeForm.prototype._hideIcon = function () {
    this._$icon.hide();
  };
  SubscribeForm.prototype._setIconClass = function (iconClass) {
    this._$icon.show().attr('class', 'fa fa-fw ' + iconClass);
  };
  SubscribeForm.prototype._setText = function (text) {
    this._$text.text(text);
  };
  SubscribeForm.prototype._setNextState = function (nextState, timeout) {
    this._timeout = setTimeout(function () {
      this.setState(nextState);
    }.bind(this), timeout);
  };
  SubscribeForm.prototype.setState = function (state) {
    clearTimeout(this._timeout);
    switch (state) {
      case 'ready':
        this._setDisabled(false);
        this._hideIcon();
        this._setText('');
        break;
      case 'loading':
        this._setDisabled(true);
        this._setText('Subscribing...');
        this._setIconClass('fa-circle-o-notch fa-spin');
        break;
      case 'error':
        this._setDisabled(false);
        this._setText('Could not subscribe. Check your email address and try again.');
        this._setIconClass('fa-exclamation-triangle');
        break;
      case 'success':
        this._setDisabled(true);
        this._setText('Success! Check your inbox to confirm your subscription.');
        this._setIconClass('fa-check');
        this._setNextState('ready', 2000);
        break;
    }
    this._currentState = state;
  };

  $(function () {
    new SubscribeForm($('.subscribe-form'));
  });
})();