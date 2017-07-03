$(function(){
  
/******* Tab ******* */
Showtab1(); 
$("#tab1").click(function(){Showtab1(); });
function Showtab1(){
       // console.log("fullname = "+mFullName);
        //alert('Tab 1 OK');
        $.ajax({
            url:"./views/person-profile.html",
            success:function(data){
                console.log(data);
                $("#app-root-tab").html(data);
                showImage('out.jpg');
            }
        });
    
}


function showImage(mImgName=""){
   //alert('OK');
                               //todo : src

    var imagName = './assets/tmp/'+mImgName;
    $('#showImage').html("<img id='iii' src='"+imagName+"' class='img-rounded img-response'>");
   // console.log(imgagename);
   $('#iii').width(100); // Units are assumed to be pixels
$('#iii').height(150);
}
function showFullname(fullname=""){
   $('#fullname').html("ชื่ออ-นามสกุล : "+fullname);
}
function showBirthday(birthday=''){
    $("#birthday").html("กิดวันที่ : "+birthday);
}
function showAddress(address=""){
    $("#address").html("ที่อยู่ : "+birthday);
}


});