// Variables globales
var users, entrys, feat;

$(document).ready(function () {
    // Cargar status
    $.get("https://raw.githubusercontent.com/GardieMaker/data/master/status/activities", function(estado, success, xhr) {
        document.getElementsByClassName("news-latest")[0].innerHTML = estado;
    });

    // Cargar afiliados
    $.get("https://raw.githubusercontent.com/GardieMaker/data/master/status/affiliates", function(afiliados, success, xhr) {
        document.getElementById("footer-links").innerHTML = afiliados;
    });

    // Cargar usuarios, entradas y destacadas
    const u = new XMLHttpRequest();u.open("GET", "https://gardiemaker.github.io/data/usr/users.json");
    u.responseType = "json";u.send();u.onload = function() {

        const e = new XMLHttpRequest();e.open("GET", "https://gardiemaker.github.io/data/usr/entries.json");
        e.responseType = "json";e.send();e.onload = function() {
            
            const f = new XMLHttpRequest();f.open("GET", "https://gardiemaker.github.io/data/usr/featured.json");
            f.responseType = "json";f.send();f.onload = function() {

                users = u.response; entrys = e.response; feat = f.response;
                normalizeURL();
                cargarSelect(users);
                cargarRanking();
                cargarListas(0);
            };
        };
    };
});

// Preparación de la interfaz
function cargarSelect(user) {
    var texto = "<option hidden selected>Filtrar por usuario...</option>";

    for (i = 0; i < user.length; i++) {
        var p = entrys.filter(v => {return v.alias == user[i].alias});
        p = p.length;
        texto += "<option value='" + user[i].alias + "'>" + user[i].alias + " (" + p + ")</option>";
    }
    
    $("#menu-user").html(texto);
}

function normalizeURL() {
    var str = window.location.search;
    
	if (str != "") {

        if (str.includes("?p=") || str.includes("?u=") || str.includes("?v=") || str.includes("?e=")) {

            // asignar atributos si no tienen valor
            if (str == "?p=" || str == "?u=" || str == "?v=" || str == "?v=") {

                switch (str) {
                    case "?v=":str = "?v=true";break;
                    case "?p=":case "?u=":str = "?p=featured";break;
                }

                history.pushState(null, "", str);
            }

		} else {
			window.location.href = "archive?p=featured";
		};
	} else {
        str="?p=featured";
        history.pushState(null, "", str);
    };

    selectMenu(str.slice(1,2), str.slice(3));
}

function cargarRanking() {
    var top1 = ["", 0], top2 = ["", 0], top3 = ["", 0];

    for (a = 0; a < users.length; a++) {
        if (users[a].alias != "Zunay") {
            var p = entrys.filter(v => {return v.alias == users[a].alias});
            p = p.length;
    
            if (top1[1] < p) {
                top3[0] = top2[0];
                top3[1] = top2[1];
        
                top2[0] = top1[0];
                top2[1] = top1[1];
        
                top1[0] = users[a].alias;
                top1[1] = p;
    
            } else if (top2[1] < p) {
                top3[0] = top2[0];
                top3[1] = top2[1];
        
                top2[0] = users[a].alias;
                top2[1] = p;
    
            } else if (top3[1] < p) {
                top3[0] = users[a].alias;
                top3[1] = p;
            };
        };
    };

    $("#top1").html('<a href="?u=' + top1[0] + '">' + top1[0] + '</a><span class="top-number">' + top1[1] + '</span>');
    $("#top2").html('<a href="?u=' + top2[0] + '">' + top2[0] + '</a><span class="top-number">' + top2[1] + '</span>');
    $("#top3").html('<a href="?u=' + top3[0] + '">' + top3[0] + '</a><span class="top-number">' + top3[1] + '</span>');

};

function selectMenu(cat, val) {
    var str = "?" + cat + "=" + val;
    history.pushState(null, "", str);

    if (document.getElementsByClassName("on")[0])
    document.getElementsByClassName("on")[0].removeAttribute("class")

    if (cat != "v" && cat != "e") {
        var q = "#menu-" + val + " > li";
        
        if (cat != "u") {
            document.querySelector(q).setAttribute("class", "on");
            $("#menu-user").val("Filtrar por usuario...");
        };
    } else {
        $("#menu-user").val("Filtrar por usuario...");
        if (cat == "e") document.querySelector("#menu-all > li").setAttribute("class", "on");
    };
};

// Carga de entradas
function cargarListas(pag) {

    var dataurl = window.location.search;
    var uCAT = dataurl.slice(1,2);
    var uVAL = dataurl.slice(3);
    uVAL = unescape(uVAL);
    uVALP = "";

    // Hay POPUP ?
    var popo = [];
    if (uCAT == "e") {
        popo = entrys.filter(function(v){return v.id == uVAL})
        history.pushState(null, "", "?p=all");
        uVALP = uVAL; uCAT = "p"; uVAL = "all";
    };

    // Cargar todas las entradas
    var entry = [];

    switch (uCAT) {
        case "u":entry = entrys.filter(function(v){return v.alias == uVAL});break;
        case "v":/*Pendiente*/break;
        case "p":
            if (uVAL == "featured") {
                uVAL = toBoolean(uVAL);
                entry = entrys.filter(function(v){return v.featured === uVAL});
            } else {
                for (i = 0; i < entrys.length; i ++) {
                    entry.push(entrys[i]);
                };
            };
            break;
    };
/*
    // Si es perfil mostrar menu
    if (uCAT == "u") {

        var existe = users.filter(function(v){return v.alias == uVAL});
        (existe.length != 0) ? $("#menu-user").val(uVAL) : window.location.search = "?p=all";

        //Pendiente V2
        if ($("#archive-menu-user")) $("div").remove("#archive-menu-user");
        var mUSR = '<div id="archive-menu-user" class="menu-section"><p>Mostrando todos los aportes de <b>' + existe[0].alias + '</b>.</div>';
        $("#archive-thumbnail-content").append(mUSR);
        

    } else if ($("#archive-menu-user")) {
        $("div").remove("#archive-menu-user");
    };
*/
    // Cargar posts en tablas segun paginacion
    dibujaTabla(entry, uVAL, pag);

    // Abre popup
    if (popo.length == 1) abrirPopup(uVALP);

}

function dibujaTabla(entry, uVAL, pag) {

    $("#archive-thumbnail-content").html("");

    // Si es perfil, mostrar titulo de filtro
    var str = window.location.search;
    if (str.includes("?u=")) {
        str = str.slice(3);
        str = '<p>Mostrando todos los aportes de <b>' + unescape(str) + '</b>.</p>';
        $("#archive-thumbnail-content").append(str);
    };

    var tabla = "<table>";
    var filtroP = [];
    
    // Cuadros por páginas 12
    var pages = Math.floor(entry.length / 12);

    // Elemento inicial
    var startPage = pag * 12;
    
    var endPage = startPage + 12;
    for (startPage; startPage < endPage; startPage += 4) {
        tabla += "<tr>";

        // c = starpage ??
        for (c = 0; c < 4; c++) {
            var suma = c + startPage;

            if (uVAL != true) {
                if(entry[suma]) {
                    
                    // Fondo pequeño
                    var bg = entry[suma].info.background;
                    bg = bg.slice(55);
                    bg = "https://www.eldarya.com/assets/img/item/player/icon/" + bg;

                    tabla += "<td><div id='" + entry[suma].id + "' class='abstract-thumbnail"

                    if (entry[suma].featured === true) {
                        tabla += " featured' style='background-image:url(" + bg 
                        + ")'><span class='feat'>DESTACADA</span>";
                    } else {tabla += "'>";};
                    tabla += "<img src='https://docs.zoho.com/docs/orig/" + entry[suma].info.png + "'></div></td>"
                } else {
                    tabla += "<td></td>";
                }
                    
            } else {
                
                if (feat[c + startPage]) {
                    var entrada = entry.filter(function(v){return v.id == feat[c + startPage].entry});

                    // Fondo pequeño
                    var bg = entrada[0].info.background;
                    bg = bg.slice(55);
                    bg = "https://www.eldarya.com/assets/img/item/player/icon/" + bg;

                    // Mostrar lista de featured
                    tabla += "<td><div id='" + feat[suma].entry + "' class='abstract-thumbnail feat-page'"
                    + " style='background-image:url(" + bg 
                    + ")'><span class='feat-title'>" + feat[suma].title + "</span><img src='https://docs.zoho.com/docs/orig/" + entrada[0].info.png + "'></div></td>";
                } else {
                    tabla += "<td></td>";
                }       
            }
        };

        tabla += "</tr>";
    };

    tabla += "</table>";
    $("#archive-thumbnail-content").append(tabla);

    // Pagination    
    //var pagesTEST = 14; // PRUEBAS TRUNCATION PAGES
    if (pages > 0) hacerPagination(pag, pages);
}


/*
    1  2  3  4  5  6  7  8  9 10 11 12
    1  2  3  4  5  6  7  8  9 .. xx xx
    1  2  .. x  x  x  x  x  x xx xx xx
    1  2  .. 4  5  6  7  8  9 10 .. 12 13
/*
    !!! CATALOGO !!!
    1  2  3  4  5  6  7  8  9 10 11 12 13 14
    1  2  3  4  5  6  7  8  9 (10) 11 .. xx xx
    1  2  .. 4  5  6  7 (8) 9 10 11 12 .. 14 15

    1  2  .. x (x)  x  x  x  x xx xx xx xx xx
            -10 -9 -8 -7 -6 -5 -4 -3 -2 -1  L
    

*/


function hacerPagination(activa, paginas) {

    var truncation = [];
    truncation.push('<div id="pagination">');

    // Necesita truncation ?
    if (paginas < 14) {
        // Sin truncation
        for (s = 0; s <=paginas; s++) {
            var num = s + 1;
            if (s == activa) {
                truncation.push('<div class="page selected">' + num + '</div>');
            } else {
                truncation.push('<div class="page">' + num + '</div>');
            };
        };
        
    } else { 
        // Si necesita truncation
        // Comprobar de qué tipo segun pag activa

        if (activa < 9 ) {
            // Inicio
            for (i = 0; i <= paginas; i++) {
                var num = i + 1;
                if (i != 11){
                    if (i == activa) {
                        truncation.push('<div class="page selected">' + num + '</div>');
                    } else {
                        truncation.push('<div class="page">' + num + '</div>');
                    };
                } else {
                    truncation.push('<span class="truncation">...</span>');
                    i = (paginas - 2);
                };
            };

        } else if ((paginas - 8) > activa && activa > 8) {
            // Medio 
            for (m = 0; m <= paginas; m++) {
                var num = m + 1;
                if (m == 2 || m == (paginas - 2)) {
                    truncation.push('<span class="truncation">...</span>');
                    if (m == 2) m = (activa - 5) ;
                } else {
                    if (m == activa) {
                        truncation.push('<div class="page selected">' + num + '</div>');
                    } else if (m == (activa + 5)) {
                        m = paginas - 3;

                    } else {
                        truncation.push('<div class="page">' + num + '</div>');
                    };
                }
            }


            // PENDIENTE
        } else if (activa >= paginas - 8) {
            // Fin
            for (f = 0; f <= paginas; f++) {
                var num = f + 1;
                if (f == 2) {
                    truncation.push('<span class="truncation">...</span>');
                    f = (paginas - 11);
                } else {
                    if (f == activa) {
                        truncation.push('<div class="page selected">' + num + '</div>');
                    } else {
                        truncation.push('<div class="page">' + num + '</div>');
                    }
                };
            }

        }

    }
/*
    !!! CATALOGO !!!
    1  2  3  4  5  6  7  8  9 10 11 12 13 14
    1  2  3  4  5  6  7  8  9 (10) 11 .. xx xx
    1  2  .. 4  5  6  7 (8) 9 10 11 12 .. 14 15

    1  2  .. x (x)  x  x  x  x xx xx xx xx xx
            -10 -9 -8 -7 -6 -5 -4 -3 -2 -1  L
    

*/

    truncation.push("</div>");
    var code = truncation.join("");
    $("#archive-thumbnail-content").append(code);
}

$(function() { 
    $("#menu-featured").click(function(){
        selectMenu("p","featured");
        cargarListas(0);
    });

    $("#menu-all").click(function(){
        selectMenu("p","all");
        cargarListas(0);
    });
    
    $("#menu-user").change(function() {
        selectMenu("u", $("#menu-user").val() );
        if ($("#archive-menu-user")) $("div").remove("#archive-menu-user");
        cargarListas(0);
    });

    $("#archive-thumbnail-content").on("click", ".abstract-thumbnail", function(){
        abrirPopup($(this).attr("id"));
    });

    $("#archive-thumbnail-content").on("click", ".page", function() {
        if ($(this).attr("class") != "page selected") {
            var pagina = ($(this).text() - 1);
            cargarListas(pagina);
        }
    });

});

function abrirPopup(elmnt) {

    $("body").css("overflow", "hidden");

    // Cargar elemento
    var entry = entrys.filter(function(v) {return v.id == elmnt});

    var fondo = entry[0].info.background;
    fondo = fondo.replace(".es", ".com");

    // Contenedor de fondo > Contenedor de ventana + botón de cierre
    var html = '<div id="popupBG"><a class="nav-box-prev"></a><div id="popupW"><div id="button-close" onclick="cierraPopup()"></div>'

    // Div principal
    + '<div id="entry-info-container" style="background-image: url(' + fondo + ')">'

    // Gardienne + nombre || id
    + '<img src="https://docs.zoho.com/docs/orig/' + entry[0].info.png + '"><div id="entry-info-menu"><div id="entry-info-quote">';
    if (entry[0].info.name) {html += '<h2>' + entry[0].info.name + '</h2><p>ID: ' + entry[0].id + '</p>'} 
    else {html += '<h2>ID: ' + entry[0].id + '</h2>'};
    
    // Estado e info de cuenta
    var user = users.filter(function(v) {return v.alias == entry[0].alias});
    html += '<p> Enviada por: <a href="?u=' + entry[0].alias + '">' + entry[0].alias + '</a><span class="';
    user[0].verified ? html += 's-verified" title="Cuenta verificada"></span></p>' : html += 's-pending" title="Cuenta sin verificar"></span></p>';
    html += '<p>Fecha: ' + entry[0].info.date + '</p><p>Abrir en: <a href="profile?s=' + entry[0].info.code + '"> Perfil</a> | <a href="wardrobe?s=' + entry[0].info.code + '">Vestidor</a></p></div>';

    
    // Destacada ?
    if (entry[0].featured) {
        var ft = feat.filter(function(v){return v.entry == entry[0].id});
        html += '<div id="entry-info-featured"><h2>★ Guardiana Destacada ★</h2>';
        var titulo = ft[0].title;
        if ((titulo).includes("Semana")) {
            titulo = "En portada durante la " + titulo.replace("Semana", "semana");
        } else {
            titulo = "Portada especial: " + titulo.replace("Semana", "semana");
        }
        html += '<p><i>' + titulo + '.</i></p>'
        + '<p>Fecha: ' + ft[0].date + '</p>';
        //"entry-info-featured"
    }
    

    // Cierre + flechas
    html += '</div></div></div></div><a class="nav-box-next"></a></div>';

    $("body").append(html)
    $("#popupBG").fadeIn(300);
}

function cierraPopup() {
    $("body").css("overflow", "auto");
    $("div").remove("#popupBG");
    $("a").remove(".nav-box-prev");
    $("a").remove(".nav-box-next");
}

// Funciones extras
function toBoolean(b) {
    if (b == "featured") return true 
    else return false;
}