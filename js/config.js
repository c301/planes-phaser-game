var Planes = Planes || {};

Planes.Config = {
    version         : '1.0.4a',
    locale          : 'en',
    mainBtn         : 'button-grey/grey_button01.png',
    mainBtnPressed  : 'button-grey/grey_button02.png',
    mainTitleStyle   : {
        font: '100px Mackerel', 
        fill: '#51A1FF',
        stroke: '#023C7F',
        strokeThickness: 2
    },
    subTitleStyle   : {
        font: '50px PFSquareSansPro', 
        fill: '#ffcc00',
        stroke: '#bf9900',
        strokeThickness: 2
    },
    mainTitleSmallStyle   : {
        font: '70px Mackerel', 
        fill: '#ffcc00',
        stroke: '#bf9900',
        strokeThickness: 2
    },
    menuStyle   : {
        font: '25px PFSquareSansPro', 
        fill: '#ffcc00',
        stroke: '#bf9900',
        strokeThickness: 1
    },
    mainTextStyle   : {
        font: '25px PFSquareSansPro', 
        fill: '#ffcc00',
        stroke: '#bf9900',
        strokeThickness: 1
    },
    techTextStyle   : {
        font: '12px Arial', 
        fill: '#666666'
    },
    cloudSpeed      : 20
}

Planes.Config.bigNotificationStyle = _.defaults({
    fill: '#ffcc00',
    stroke: '#bf9900',
}, Planes.Config.mainTitleSmallStyle);

Planes.Config.gameOverStyle = _.defaults({
    fill: '#FF461B',
    stroke: '#7F230D'
}, Planes.Config.mainTitleSmallStyle);

Planes.Config.winLevelStyle = _.defaults({
    fill: '#5FCC18',
    stroke: '#639940'
}, Planes.Config.mainTitleSmallStyle);

