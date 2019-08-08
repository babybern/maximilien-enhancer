// ==UserScript==
// @name         Maximilien
// @namespace    https://github.com/babybern/maximilien-enhancer
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://marches.maximilien.fr/*?page=*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==
var signature = `
Cordialement,

Prénom NOM
Tél :
`

var attribution = `
Bonjour\n
J'ai le plaisir de vous informer que votre proposition relative au marché mentionné en objet a été retenue.\n
A cet effet, je vous remercie de bien vouloir prendre connaissance du courrier joint à cet envoi.\n`;
var notification = `
Votre entreprise a été déclarée attributaire de la consultation citée en référence.
Veuillez-trouver à titre de notification le marché signé par le Représentant du Pouvoir Adjudicateur.
L'Accusé de réception de ce message vaut notification officielle du marché.`
var rejet = `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
Nous sommes toutefois au regret de vous annoncer que votre réponse n'a pas été retenue par le Représentant du Pouvoir Adjudicateur.`
var modif_consultation = `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
Nous sommes toutefois au regret de vous annoncer que votre réponse n'a pas été retenue par le Représentant du Pouvoir Adjudicateur.`
var demande_complement = `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
Après analyse, il vous est demandé d'apporter les précisions suivantes : [à préciser au cas par cas].
La réponse à ces questions peut se faire via l'application, à partir de la page d'accès à cette demande de complément.
Il est nécessaire de disposer d'un Compte entreprise sur l'application pour accéder à cette réponse.`
var annulation_consultation = `La consultation citée en référence a été annulée.`


(function() {
    'use strict';

    // copyonclick(element) ==> permet de copier dans le presse papier un élément
    function copyonclick(element) {
        element.addEventListener('click',function(e){GM_setClipboard(e.target.innerText);})
    }
    var off = function (event, elem, callback, capture) {
	if (typeof (elem) === 'function') {
		capture = callback;
		callback = elem;
		elem = window;
	}
	capture = capture ? true : false;
	elem = typeof elem === 'string' ? document.querySelector(elem) : elem;
	if (!elem) return;
	elem.removeEventListener(event, callback, capture);
    };

    //STYLES CSS
    var cssheet = document.createElement('style');
    cssheet.innerHTML = `
.blockListEmail {width: auto; margin-left:205px; display: block}
.adresseEmail {border: 1px solid black; position: relative; display: inline-table; margin: 2px 2px 2px 2px; padding: 0 2px 0 2px; border-radius: 25px}
.adresseEmail:before {}
a.bouton-retour {border: 1px; border-radius: 25px; color: violet}
`;
    document.body.appendChild(cssheet);

    //Récupération de l'intitulé de la page
    var page = document.URL.split('=')[1].split('&')[0].split('.')[1]

    switch(page) {
        case 'EnvoiCourrierElectroniqueChoixDestinataire':
            //La base : on coche la case 'adresses libres'
            document.getElementById('ctl0_CONTENU_PAGE_checkAdressesLibres').checked = true

            // Refonte de la liste des contacts ayant déposé une offre
            // Chaque adresse email est contenu dans une div
            // à cette div est ajouté un event 'click' qui copie l'adresse dans la liste 'libre'
            var zoneTexte = document.getElementById('ctl0_CONTENU_PAGE_AdressesRegistreDepots');
            var parentZT = zoneTexte.parentNode;
            var listeDepots = zoneTexte.innerHTML.split(' , ');

            parentZT.removeChild(zoneTexte);
            var newBlockDiv = document.createElement("div");
            parentZT.appendChild(newBlockDiv);
            newBlockDiv.classList.add('blockListEmail');
            listeDepots.forEach(function (courriel) {
                console.log(courriel);
                var newDiv = document.createElement("span");
                var newContent = document.createTextNode(courriel);
                newDiv.classList.add('adresseEmail');
                newDiv.appendChild(newContent);
                newBlockDiv.appendChild(newDiv);
                newDiv.addEventListener('click', function(e){document.getElementById('ctl0_CONTENU_PAGE_adressesLibres').innerText = e.target.innerText;});


            });
            break;
        case 'DetailConsultation':
            // Petit ajout : un click sur l'adresse URL de la consultation la copie dans le presse-papier
            document.getElementsByClassName('code')[0].innerText = document.getElementsByClassName('code')[0].innerText+' - '+document.getElementsByClassName('code')[0].nextSibling.innerText
            document.getElementsByClassName('code')[0].removeAttribute('onmouseover')
            document.getElementById('ctl0_CONTENU_PAGE_consultationAdditionalInformations_urlDirecteConsultation').addEventListener('click',function(e){GM_setClipboard(e.target.innerText);GM_notification('URL copiée','Maximilien','https://marches.maximilien.fr/themes/images/logo.gif')})
            document.getElementById('ctl0_CONTENU_PAGE_IdConsultationSummary_objet').addEventListener('click',function(e){GM_setClipboard(e.target.innerText);GM_notification('URL copiée','Maximilien','https://marches.maximilien.fr/themes/images/logo.gif')})
            break;
        case 'EnvoiCourrierElectroniqueSimple':
            // On clone la liste des type de messages(car on peut pas supprimer l'évenement ! Allo ?!)
            var oldInput = document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType')
            var newInput = oldInput.cloneNode(true);
            newInput.id = "choixTypeMessage";
            oldInput.insertAdjacentElement('afterend', newInput);
            oldInput.parentNode.removeChild(oldInput);
            //document.getElementBy
            //document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_textMail').innerHTML = attribution;
            break;
        case 'ChangingConsultation':
            break;
        case 'TableauDeBord':

            break;
        case 'ouvertureEtAnalyse':
            break;
        case 'GestionRegistres':
            // Clic sur la question ==> copie dans le presse-papier
            document.querySelectorAll('[headers=retrait_el_Fichiers]').forEach(function(element) {
                copyonclick(element);
            });
            break;
        default:
            console.log('hey');
    }
})();