function calc(x,a1,a2,a3,a4,g1,g2,g3,time){
    e_o_c = calibration();
    var g22 = g2/(1+2*g2/(1.022/e_o_c));
    g12 = 10000*Math.random();
    g32 = 20*Math.random();
    var t1 = Math.exp((x-a3)/a4);
    var t2 = (1+a2*a2*t1);
    var t3 = (t1+Math.pow((1-a2*t1),2));
    var t4 = g1*Math.exp(-Math.pow(((x-g2)/g3),2));
    var t5 = g12*Math.exp(-Math.pow(((x-g22)/g32),2));
    var k = Math.round((a1*Math.pow(t2/t3,0.5)+t4+t5) / 10000*time);
    return k;
}

function Puas(P){
    var j1 = Math.exp(-P);
    var n1 = 50*Math.random();
    var k=0;
    for(;;){
        if(n1 <= j1) break;
        k++;
        n1 = n1 *Math.random();
    }
    return k;
}
function random_cs_peak(x_min){ //случайное положение для пика цезия
    var cs_peak_channel
    do
        cs_peak_channel = 1527*Math.random();
    while ((cs_peak_channel <= x_min+200)); //минимум 800,чтобы не прижимать спектр к левой границе видимой области
    //можно брать X_min+ const в качетсвте минимума
    return cs_peak_channel
}
function calibration(){ //в качестве входных параметров- энергия пика цезия
    var cs_decay_energy = 0.6617; // энергия распада цезия
    var na_peak_channel = 2940;   //пересчитываем энергию натрия
    var na_decay_energy = 1.27;   //энергия рапспада натрия
    var energy_on_channel =(na_decay_energy - cs_decay_energy) / (na_peak_channel-random_cs_peak());
    return energy_on_channel;
}


function number_to_energy(number){
    var energy;
    switch (number) {
        case 1:
            energy = 1527;break;
        case 2:
            energy = 2900;break;
        case 3:
            energy = 1200;break;
        case 4:
            energy = 1400;break;
        case 5:
            energy = 2100;break;
        default :
            energy = 2000;break;
    }
    return energy;
}

function buf_m_set_zero(buf_m){
    for (var i = 0; i < 5000; i++) {
        buf_m[i] = 0;
    }
}

function number_to_energy_double_peak(number) {
    var energy;
    switch (number) {
        case 5:
            energy = 1200;break;
    }
    return energy;
}

function check_isotope(checked_radio,last_checked_radio){
  if (checked_radio != last_checked_radio) {
        energy_1 = 0;
        buf_m_set_zero(buf_m);
        last_checked_radio = checked_radio;
        peak_channel =
            number_to_energy(parseInt(checked_radio));
        spectrum_points.length = 0;
        a[1] = -1.38 * peak_channel + 4106;
        a[2] = 0.0004 * peak_channel + 0.279;
        a[3] = 0.9789 * peak_channel - 432;
        a[4] = 0.032 * peak_channel + 21.44;
        a[5] = 10000;
        a[6] = peak_channel;
        a[7] = 3;
        a[12]= 0;
        a[52]= 0;
  }
}

function check_channel( answer, peak_channel, peak_on_channel ){
    var buffer = 0;
    var right_answer = peak_on_channel * peak_channel;
    if (right_answer < (answer*0.1+answer) && (right_answer > (answer-answer*0.1)))
        buffer = 1;
    return buffer;
}