function openWindow(windID){
	document.getElementById(windID).style.display = "block";
}

function closeWindow(windID){
	document.getElementById(windID).style.display = "none";
}

function toggleWindow(windID){
    if (document.getElementById(windID).style.display === "none" || document.getElementById(windID).style.display === ""){
      openWindow(windID);
    } else {
      closeWindow(windID);
    }
}


