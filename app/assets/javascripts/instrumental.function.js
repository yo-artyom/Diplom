var cs_peak_channel,
    puasson_parametr = 50*Math.random();
//------вычисление отсчетов от времени--------------
function calc(x,a1,a2,a3,a4,g1,g2,g3,time){
    var energy_on_channel = calibration();

    var g22 = g2/(1+2*g2/(1.022/energy_on_channel));
    g12 = 10000*Math.random();
    g32 = 20*Math.random(); // пик обратного рассеяния

    var t1 = Math.exp((x-a3)/a4);
    var t2 = (1+a2*a2*t1);
    var t3 = (t1+Math.pow((1-a2*t1),2));
    var t4 = g1*Math.exp(-Math.pow(((x-g2)/g3),2));
    var t5 = g12*Math.exp(-Math.pow(((x-g22)/g32),2));
    return Math.round((a1*Math.pow(t2/t3,0.5)+t4+t5) / 10000*time);

}
//------зашумление по пуассону----------------
function Puas(P){
    var j1 = Math.exp(-P);
    var n1 = puasson_parametr;
    var k=0;
    for(;;){
        if(n1 <= j1) break;
        k++;
        n1 = n1 *Math.random();
    }
    return k;
}

/*function random_peak(photopeak_channel){ //случайное положение для пика цезия
    var random_photopeak_channel;
    switch (photopeak_channel) {
        case 1537:
            do
                random_photopeak_channel = photopeak_channel*Math.random();
            while (random_photopeak_channel <800 );
            break;
        case 2940:
            do
                random_photopeak_channel = photopeak_channel*Math.random();
            while (random_photopeak_channel < 1537 );
            break;
        return random_photopeak_channel
    }

        do
        cs_peak_channel = 1527*Math.random();
    while ((cs_peak_channel <= 800)); //минимум 800,чтобы не прижимать спектр к левой границе видимой области
    //можно брать X_min + const в качетсвте минимума
    return cs_peak_channel
}*/
//--функция калибровки (энергия приходящееся на 1 канал текущего спектрометра)---
function calibration(){
        //в качестве входных параметров- энергия пика цезия
        cs_peak_channel = 1537;
    var cs_decay_energy = 0.6617; // энергия распада цезия
    var na_peak_channel = 2940;   //пересчитываем энергию натрия
    var na_decay_energy = 1.27;   //энергия рапспада натрия
    return (na_decay_energy - cs_decay_energy) /
       (na_peak_channel-cs_peak_channel);
}
//---проверка номера изотопа, и передача его номера канала---
function energy_to_channel(number){
    var energy;
    switch (number) {
         case 1:
            energy = 0.6617 / calibration();break;
        case 2:
            energy = 1.27 / calibration();break;
        case 3:
            energy = 0.8 / calibration();break;
        case 4:
            energy = 0.9 / calibration();break;
        case 5:
            energy = 1.17 /  calibration();break;
        default :
            energy = 2000;break;
    }
    return energy;
}

function array_set_zero(array){
    for (var i = 0; i < array.length - 1; i++) {
        array[i] = 0;
    }
}

function energy_to_channel_double_peak() {
    return 1.55 / calibration();
}

function check_channel( answer, peak_channel, peak_on_channel ){
    var buffer = 0;
    var right_answer = peak_on_channel * peak_channel;
    if (right_answer < (answer*0.1+answer) && (right_answer > (answer-answer*0.1)))
        buffer = 1;
    return buffer;
}

