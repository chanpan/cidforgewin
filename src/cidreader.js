const smartcard = require('smartcard');
const Devices = smartcard.Devices;
const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;
const pcsc1 = require('pcsclite');
const pcsc = pcsc1();
const legacy = require('legacy-encoding');
let cmdIndex = 0;
let inGetImage = false;

let imgTemp = '';
const fs = require('fs');


devices.on('device-activated', event => {
    const currentDevices = event.devices;
    let device = event.device;
    console.log(`Device '${device}' activated, devices: ${currentDevices}`);
    for (let prop in currentDevices) {
        console.log("Devices: " + currentDevices[prop]);
    }

    device.on('card-inserted', event => {
        mImgTemp ='';
        let card = event.card;
        console.log(`Card '${card.getAtr()}' inserted into '${event.device}'`);

        card.on('command-issued', event => {
            console.log(`Command '${event.command}' issued to '${event.card}' `);
        });

        card.on('response-received', event => {
            if (inGetImage) {
                //    console.log('read image ' +imgTemp);

                // readImageOneLine(card);
            } else {

                //console.log('no read image ' +imgTemp);
            }
            // console.log(`Response '${event.response}' received from '${event.card}' in response to '${event.command}'`);
        });


        card
            .issueCommand(new CommandApdu(new CommandApdu({ bytes: [0x00, 0xA4, 0x04, 0x00, 0x08, 0xA0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01] })))
            .then((response) => {
                console.log(response);
                //     readImageOneLine(card);
                readData(card);

            }).catch((error) => {
                console.error(error);
            });


    });
    device.on('card-removed', event => {
        console.log(`Card removed from '${event.name}' `);
    });

});

devices.on('device-deactivated', event => {
    console.log(`Device '${event.device}' deactivated, devices: [${event.devices}]`);
});


let mImgTemp = '';
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function readData(card) {

    card
        .issueCommand((new CommandApdu({ bytes: [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d] })))
        .then((response) => {
            console.log(`readCid '${response.toString('hex')}`);

            card
                .issueCommand((new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0x0d] })))
                .then((response) => {
                    //MTQwOTkwMDM5NjIwNZAA  
                    //     response ="1409900396205";
                    //
                    response = response.slice(0, -2);
                    //   let mImgTemp = response.toString();

                    console.log(`Response readCid ${mImgTemp}`);
                    readImageOneLine(card);
                    //  readFullname(card);
                }).catch((error) => {
                    console.error(error);
                });


        }).catch((error) => {
            console.error(error);
        });

}

function readFullname(card) {

    card
        .issueCommand((new CommandApdu({ bytes: [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0xd1] })))
        .then((response) => {

            card
                .issueCommand((new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0xd1] })))
                .then((response) => {
                    //   var x=  iconv.convert(response); // returns "a va"
                    var buffer = legacy.decode(response, "tis620");
                    console.log(`Response readFullname '${buffer}`)
                    readAddress(card);
                }).catch((error) => {
                    console.error(error);
                });


        }).catch((error) => {
            console.error(error);
        });

}


function readAddress(card) {

    card
        .issueCommand((new CommandApdu({ bytes: [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64] })))
        .then((response) => {

            card
                .issueCommand((new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0x64] })))
                .then((response) => {
                    var buffer = legacy.decode(response, "tis620");
                    console.log(`Response readFullname '${buffer}`)
                    // readImageOneLine(card);
                }).catch((error) => {
                    console.error(error);
                });


        }).catch((error) => {
            console.error(error);
        });

}

let checkMod = 0;
function readImageOneLine(card) {
    let ccc = 255;
    let xwd;
    let xof = (cmdIndex) * ccc + 379;
    if (cmdIndex == 20)
        xwd = 38;
    else
        xwd = ccc;
    // console.log('tttt ' + xof);

    let sp2 = (xof >> 8) & 0xff;

    // console.log('tttt2 ' + (xof >> 8));

    let sp3 = xof & 0xff;
    let sp6 = xwd & 0xff;
    let spx = xwd & 0xff;
   let  CMD1 = [0x80, 0xb0, sp2, sp3, 0x02, 0x00, sp6];
    let CMD2 = [0x00, 0xc0, 0x00, 0x00, sp6];

    card
        .issueCommand((new CommandApdu({ bytes: CMD1 })))
        .then((response) => {
            console.log(`Response image2 '${response.toString('hex')}`)
            card
                .issueCommand((new CommandApdu({ bytes: CMD2 })))
                .then((response) => {

                    imgTemp = imgTemp + response.toString('base64')//.replace('kAA=','');//.slice(0,-2).toString('base64');
                    checkMod++;
                    //  }
                    if (cmdIndex < 20) {
                        ++cmdIndex;
                        inGetImage = true;
                        readImageOneLine(card);
                    } else {
                        let mImgTemp = imgTemp;

                        inGetImage = false;
                        // var stream = fs.createWriteStream("my_file.txt", { mode: 0o755 });
                        // stream.once('open', function (fd) {
                        //     stream.write(mImgTemp);
                        //     stream.end();
                        // });
                        var dir = './tmp';

                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        fs.writeFile("./tmp/out.jpg", mImgTemp, 'base64', function (err) {
                            console.log(err);

                            //showImage('');
                            var imgname = './tmp/out.jpg';
                            $('#showImage').html("<img src='" + imgname + "' class='img img-response'>");

                        });
                        mImgTemp='';
                        imgTemp='';
                        cmdIndex=0;
                    }

                }).catch((error) => {
                    console.error(error);
                });


        }).catch((error) => {
            console.error(error);
        });

}

