'use strict';

var id = '';
var question = '';
var file_extension = '';
var selectedGene = '';

$(document).ready(function() {

  $('.getResultButton').click(function() {
    var output_format = $(this).attr('data-attr');
    var output_type = $(this).attr('data-type');
    var list = document.getElementById("geneList");
    selectedGene = list.options[list.selectedIndex].text;
    question = question + selectedGene;
    var parameters = { };
    var answers = [];

    $.get( '/api/getresult',{question}, function(results) {
      var table = document.getElementById("answers");
      
      for (var i = 0; i < results.length; i++) {
        var row = table.insertRow(-1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        cell0.innerHTML = results[i].title;
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
      
      $('.submitRankingButton').click(function() {
        $.get( '/api/getgtdata',{}, function(gtdata) {  
          var labels = [];
          for (var i = 0; i < results.length; i++) {
            var o = document.getElementById("answer" + i +"Options");
            //if (o.options[o.selectedIndex].value != 0) {
              var label = {
                id : results[i].id,
                rank : o.options[o.selectedIndex].value
              }

              labels.push(label);  
            //}
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
          gtdata.push(newRank);
          $.post('/updategt',{gtdata}, function(data){
          });
        });
      });
    });
    
    document.getElementById("display_input_doc").innerHTML = question + '?';

    $('._content--output.active').removeClass('active');
    $('._content--output').addClass('active');

    $('.format--list-item-tab.active').removeClass('active');
    $(this).addClass('active');

    var top = document.getElementById('choose-output-format').offsetTop;
    window.scrollTo(0, top);

    $('.endSessionButton').click(function() {
      $.post('/createRanker',{}, function(data){
      });
    });

  });

  /**
   * Event handler for reset button
   */
   $('.reset-button').click(function() {
    location.reload();
  });

 });

function highlightTFs(){
  var parameters = { };
  $.get( '/api/gettfs',parameters, function(data) {
    data = unique(data);
    for (var i = 0; i < data.length; i++) {
      highlightAnswer(data[i]);
    }
  });

  var table = document.getElementById("answers");
  var noRows = table.rows.length;
  var paragraphs = [];
  for (var i = 0; i < noRows; i++) {
    paragraphs.push(table.rows[i].innerHTML);
  }
  $.get( '/api/getproxsearch' , {paragraphs}, function(data) {
    createGraph(data);
  });
}

function highlightAnswer(text){
  var table = document.getElementById("answers");
  var noRows = table.rows.length;
  for (var i = 0; i < noRows; i++) {
    var innerHTML = table.rows[i].innerHTML;
    var index = innerHTML.toUpperCase().indexOf(text);
    if ( index >= 0 )
    { 
      innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
      table.rows[i].innerHTML = innerHTML;
    }
  }
}

function chooseQ1() {
  hideError();
  id = '1';
  question = 'What is the regulator of '
  clear_file_upload();
  $('.download--input-icon').attr('href', '/files/' + id + '?download=true');
  
  $('._content--choose-output-format.active').removeClass('active');
  $('._content--output.active').removeClass('active');
  $('._content--choose-output-format').addClass('active');
  $('.sample--list-item-tab.active').removeClass('active');
  $('.upload--container.active').removeClass('active');
  $('.format--list-item-tab.active').removeClass('active');
  $('.sample--list-item-tab:eq(0)').addClass('active');
  $('.code--output-code').empty();

  displayGeneList();

  var top = document.getElementById('upload-your-document').offsetTop;
  window.scrollTo(0, top);
}

function chooseQ2() {
  hideError();
  id = '2';
  question = 'What is the target gene of '
  clear_file_upload();
  $('.download--input-icon').attr('href', '/files/' + id + '?download=true');

  $('._content--choose-output-format.active').removeClass('active');
  $('._content--output.active').removeClass('active');
  $('._content--choose-output-format').addClass('active');
  $('.sample--list-item-tab.active').removeClass('active');
  $('.upload--container.active').removeClass('active');
  $('.format--list-item-tab.active').removeClass('active');
  $('.sample--list-item-tab:eq(1)').addClass('active');
  $('.code--output-code').empty();

  displayTFs();

  var top = document.getElementById('upload-your-document').offsetTop;
  window.scrollTo(0, top);
}

function chooseQ3() {
  hideError();
  id = '3';
  question = 'Is the regulation of positive or negative ';
  clear_file_upload();
  $('.download--input-icon').attr('href', '/files/' + id + '?download=true');

  $('._content--choose-output-format.active').removeClass('active');
  $('._content--output.active').removeClass('active');
  $('._content--choose-output-format').addClass('active');
  $('.sample--list-item-tab.active').removeClass('active');
  $('.upload--container.active').removeClass('active');
  $('.format--list-item-tab.active').removeClass('active');
  $('.sample--list-item-tab:eq(2)').addClass('active');
  $('.code--output-code').empty();

  displayGeneList();

  var top = document.getElementById('upload-your-document').offsetTop;
  window.scrollTo(0, top);

}

function getUserQuestion() {
  hideError();
  id = '4';
  question = document.getElementById('userQuestion').value;

  $('._content--choose-output-format.active').removeClass('active');
  $('._content--output.active').removeClass('active');
  $('._content--choose-output-format').addClass('active');
  $('.sample--list-item-tab.active').removeClass('active');
  $('.upload--container.active').removeClass('active');
  $('.format--list-item-tab.active').removeClass('active');
  $('.sample--list-item-tab:eq(2)').addClass('active');
  $('.code--output-code').empty();
  
  var top = document.getElementById('upload-your-document').offsetTop;
  window.scrollTo(0, top);

}

function displayTFs() {
  var parameters = { };
  $.get( '/api/gettfs',parameters, function(data) {
    data = unique(data);
    data.sort();
    var list = document.getElementById("geneList");
    list.innerHTML = '';
    for (var i = 1; i < data.length; i++) {
      var option = document.createElement("option");
      option.value = data[i];
      option.text = data[i];
      list.appendChild(option);
    }
  });
}

function displayGeneList() {
  var parameters = { };
  $.get( '/api/getgenes',parameters, function(data) {
    data = unique(data);
    data.sort();
    var list = document.getElementById("geneList");
    list.innerHTML = '';
    for (var i = 1; i < data.length; i++) {
      var option = document.createElement("option");
      option.value = data[i];
      option.text = data[i];
      list.appendChild(option);
    }
  });
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
