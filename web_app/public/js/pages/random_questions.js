'use strict';

var question = '';
var id = '';
var file_extension = '';
var selectedGene = '';
var params = [];

$(document).ready(function() {
  var output_format = $(this).attr('data-attr');
  var output_type = $(this).attr('data-type');
  var count = localStorage.getItem("count");
  if (count == null) {count = 0};
  $.get( '/api/getgtdata',{}, function(gtdata) {
    generateRandomQuestion(gtdata,count);
    $.get( '/api/getresult',{question}, function(results) {
      var table = document.getElementById("answers");
      for (var i = 0; i < results.length; i++) {
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = results[i].body;
        var cellOption = "<select id=\"answer" + i +"Options\">";

        cellOption += "<option ";
        cellOption += "value=\"" + 0 + "\">" + "not relevant";
        cellOption += "</option>"
        
        for (var j = 1; j < 10; j++) {
          cellOption += "<option ";
          cellOption += "value=\"" + j + "\">" + j;
          cellOption += "</option>"
        }
        cellOption += "</select>";
        cell2.innerHTML = cellOption;
        row = table.insertRow(-1);
        cell1 = row.insertCell(0);
        cell1.innerHTML = "<br>";

      }
      highlightTFs();
      
      $('.newQuestionButton').click(function() {
        var labels = [];
        for (var i = 0; i < results.length; i++) {
          var o = document.getElementById("answer" + i +"Options");
          if (o.options[o.selectedIndex].value != 0) {
            var label = {
              id : results[i].id,
              rank : o.options[o.selectedIndex].value
            }

            labels.push(label);  
          }
        }
        if (labels.length == 0) {
          var label = {
              id : 1,
              rank : 1
            }

            labels.push(label);
        }
        var newRank = {
          question : question,labels : labels
        }
        gtdata.splice(id,1);
        gtdata.push(newRank);
        $.post('/updategt',{gtdata}, function(data){
        });
        count++;
        localStorage.setItem("count", count);
        location.reload();
      });

      $('.endSessionButton').click(function() {
        $.post('/createRanker',{}, function(data){
        });
      });
    });
  });


  $('._content--output.active').removeClass('active');
  $('._content--output').addClass('active');

  $('.format--list-item-tab.active').removeClass('active');
  $(this).addClass('active');

  /**
   * Event handler for reset button
   */
   $('.reset-button').click(function() {
    location.reload();
  });

});

function highlightTFs() {
  var parameters = { };
  $.get( '/api/gettfs',parameters, function(data) {
    data = unique(data);
    for (var i = 0; i < data.length; i++) {
      highlightAnswer(data[i]);
    }
  });
}

function highlightAnswer(text) {
  var table = document.getElementById("answers");
  var noRows = table.rows.length;
  for (var i = 0; i < noRows; i++) {
    var innerHTML = table.rows[i].innerHTML;
    var index = innerHTML.toUpperCase().indexOf(text);
    if ( index >= 0 ) { 
      innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
      table.rows[i].innerHTML = innerHTML;
    }
  }
}

function generateRandomQuestion(gtdata,count) {
  id = Math.floor(Math.random() * (gtdata.length-count));
  question = gtdata[id].question;
  document.getElementById("display_input_doc").innerHTML = question + '?';
  var top = document.getElementsByClassName('tab-panels').offsetTop;
  window.scrollTo(0, top);
}

function unique(list) {
  var result = [];
  $.each(list, function(i, e) {
    if ($.inArray(e, result) == -1) result.push(e);
  });
  return result;
}

function showError(message) {
  $('.error').text(message);
  $('.error').show();
}

function hideError(){
  $('.error').hide();
}
function clear_file_upload() {
  hideError();
  $('#input-chooser-input').val('');
  $('.upload--file-chooser-name').html('');
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
