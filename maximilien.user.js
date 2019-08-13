// ==UserScript==
// @name         Maximilien enhancer
// @namespace    https://github.com/babybern/maximilien-enhancer
// @version      0.2
// @description  Amélioration fonctionnelle de l'interface acheteur de Maximilien.
// @author       babybern
// @match        https://marches.maximilien.fr/*?page=*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @downloadURL  https://github.com/babybern/maximilien-enhancer/raw/master/maximilien.user.js
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_addStyle
// ==/UserScript==

/*
Configuration des messages types. Dans le tableau 'messages', laisser la première valeur à false.
Pour le multiligne, ne pas oublier les accent " ` " délimiteur et peut être les retour à la ligne ("\n").
Le message qui a la valeur 'default' à true sera complété par défaut.
*/
var messageIntro = `Bonjour,\n`
var signature = `
Cordialement,

Prénom NOM
Tél :
`
var messages = [false]
//ATTRIBUTION
messages.push({'typeMessage': 'Courrier d\'attribution', 'objet': '[ATTRIBUTION] {objet}','message': `
J'ai le plaisir de vous informer que votre proposition relative au marché mentionné en objet a été retenue.\n
A cet effet, je vous remercie de bien vouloir prendre connaissance du courrier joint à cet envoi.\n`});
// NOTIFICATION
messages.push({'typeMessage': 'Courrier de notification', 'objet': '[NOTIFICATION] {objet}', 'message': `
Votre entreprise a été déclarée attributaire de la consultation citée en référence.
Veuillez-trouver à titre de notification le marché signé par le Représentant du Pouvoir Adjudicateur.
L'Accusé de réception de ce message vaut notification officielle du marché.`});
// REJET
messages.push({'typeMessage': 'Courrier de rejet', 'objet': '[REJET] {objet}', 'message': `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
Nous sommes toutefois au regret de vous annoncer que votre réponse n'a pas été retenue par le Représentant du Pouvoir Adjudicateur.`});
// Modification consultation
messages.push({'typeMessage': 'Modification de la consultation', 'objet': '[MODIFICATION] {objet}', 'message': `
La consultation a été modifiée.`});
// Messsage libre
messages.push({'typeMessage': 'Message libre', 'objet': '{objet}', 'default': true, 'message': `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
MESSAGE LIBRE.`});
// DEMANDE DE COMPLEMENT
messages.push({'typeMessage': 'Demande de compléments', 'objet': '[DEMANDE DE COMPLEMENTS] {objet}', 'message': `
Nous vous remercions d'avoir répondu à la consultation citée en référence.
Après analyse, il vous est demandé d'apporter les précisions suivantes : [à préciser au cas par cas].
La réponse à ces questions peut se faire via l'application, à partir de la page d'accès à cette demande de complément.
Il est nécessaire de disposer d'un Compte entreprise sur l'application pour accéder à cette réponse.`});
// ANNULATION
messages.push({'typeMessage': 'Annulation de la consultation', 'objet': '[ANNULATION] {objet}', 'message': `La consultation citée en référence a été annulée.`});

//CSS
GM_addStyle(`
.blockListEmail {width: auto; margin-left:205px; display: block}
.adresseEmail {border: 1px solid black; position: relative; display: inline-table; margin: 2px 2px 2px 2px; padding: 0 2px 0 2px; border-radius: 25px}
.adresseEmail:before {}
a.bouton-retour {border: 1px solid violet; border-radius: 25px; color: violet}
`);

//Outils
//Mise des paramètres GET dans un tableau getUrlVars

/**
 * Returns an Array of all url parameters
 * @return {[Array]} [Key Value pairs form URL]
 */

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
};

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function removeElement(element) {
    return element.parentNode.removeChild(element);
}

function cloneAndReplace(element) {
    var oldElement = element
    var newElement = oldElement.cloneNode(true);
    oldElement.insertAdjacentElement('afterend', newElement);
    removeElement(oldElement);
}

function xhrFetch(obj){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    };
    //index.php?page=agent.EnvoiCourrierElectroniqueChoixDestinataire&IdRef=340272&forInvitationConcourir=&IdEchange=254478
    xhr.open('POST', 'index.php?page=agent.EnvoiCourrierElectroniqueChoixDestinataire&IdRef=340272&forInvitationConcourir=&IdEchange=254478', true);
    xhr.send("fname=Henry&lname=Ford");
}

// copyonclick(element) ==> permet de copier dans le presse papier un élément
function copyonclick(element) {
    element.addEventListener('click',function(e){GM_setClipboard(e.target.innerText);})
}

// variables utiles
// ...
(function() {
    'use strict';

    switch(getUrlVars().page) {
        case 'agent.EnvoiCourrierElectroniqueChoixDestinataire':
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
        case 'agent.DetailConsultation':
            // Petit ajout : le code CPV est affiché AVEC son intitulé à côté, plus besoin de laisser la souris dessus
            document.getElementsByClassName('code')[0].innerText = document.getElementsByClassName('code')[0].innerText+' - '+document.getElementsByClassName('code')[0].nextSibling.innerText;
            document.getElementsByClassName('code')[0].removeAttribute('onmouseover');
            // Petit ajout : un click sur l'adresse URL de la consultation ou l'objet les copie dans le presse-papier
            copyonclick(document.getElementById('ctl0_CONTENU_PAGE_consultationAdditionalInformations_urlDirecteConsultation'));
            copyonclick(document.getElementById('ctl0_CONTENU_PAGE_IdConsultationSummary_objet'));
            break;
        case 'agent.EnvoiCourrierElectroniqueSimple':
            // Variables
            var messageTextarea = document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_textMail');
            var objetInput = document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_objet');
            var selectMessageType = '';
            var objetConsultation = document.getElementById('ctl0_CONTENU_PAGE_IdConsultationSummary_objet').innerText;

            // On clone la liste des type de messages(car on peut pas supprimer l'évenement ! Allo ?!)
            // Et on ajoute des messages perso
            cloneAndReplace(document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType'));
            document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').value


            // Refonte du choix des destinataires (bref, on reste dans la même page !)
            // Et du coup idem pour le bouton, on le clone
            cloneAndReplace(document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_buttonEditdestinataire'));
            document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').innerHTML = '';
            var urlEncodedData = "";
            var urlEncodedDataPairs = [];
            var name;

            var formData = new FormData(document.getElementById('ctl0_ctl2'));
            var i = 0;

            // Refonte du menu select en fonction des messages défini au début du script
            messages.forEach(function(element){
                if(element.default){
                    var objet = element.objet;
                    objet = objet.replace('{objet}', objetConsultation);
                    objetInput.value = objet;
                    messageTextarea.value = messageIntro+element.message+signature;
                }
                console.log(element.typeMessage);
                var optionElement = document.createElement('option');
                optionElement.value = i;
                if(!element){
                    optionElement.innerText = 'Choisir un type de message';
                }
                else{
                    optionElement.innerText = element.typeMessage;
                }
                document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').appendChild(optionElement);
                i = i+1;
            });
            var changeType;
            document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').addEventListener('change', changeType = function(event){
                console.log(document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').value);
                if(messages[document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').value]) {
                    var objet = messages[document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').value].objet;
                    objet = objet.replace('{objet}', objetConsultation);
                    messageTextarea.value = messageIntro+messages[document.getElementById('ctl0_CONTENU_PAGE_TemplateEnvoiCourrierElectronique_messageType').value].message+signature;
                    objetInput.value = objet;
                }
            });
            break;
        case 'agent.ChangingConsultation':
            break;
        case 'agent.TableauDeBord':

            break;
        case 'agent.ouvertureEtAnalyse':
            break;
        case 'agent.GestionRegistres':
            // Clic sur la question ==> copie dans le presse-papier
            document.querySelectorAll('[headers=retrait_el_Fichiers]').forEach(function(element) {
                copyonclick(element);
            });
            break;
        default:
            console.log('hey');
    }
})();
