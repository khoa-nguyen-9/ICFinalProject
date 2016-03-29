'use strict';

var question = '';
var id = '';
var file_extension = '';
var selectedGene = '';
var params = [];

$(document).ready(function() {
  
});

function showError(message) {
  $('.error').text(message);
  $('.error').show();
}

function hideError(){
  $('.error').hide();
}

/*
Tabbed Panels js
*/
(function() {
  $('.tab-panels--tab').click(function(e) {
    e.preventDefault();
    var self = $(this);
    var inputGroup = self.closest('.tab-panels');
    var idName = null;

    inputGroup.find('.active').removeClass('active');
    self.addClass('active');
    idName = self.attr('href');
    $(idName).addClass('active');
  });
})();
