/**
/**
 * Created by Artem Malyshev on 22.03.15.
 */
//  TODO:
//  * сделать кнопку построить неактивной, пока идет измерение
//  *

 init = function(){
    Array.prototype.set_zero = function(){
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
     return true;
    }
    function IsNumber(n){
      return ( ( n === +n && n !== (n|0) ) || (n === +n && n === (n|0) ));
    };
    var spectrum_points = [],// [канал, отсчеты]
        buf,    //буфер для вычислений
        buf_old = new Array(5000), //буфер для хранения последних значений отсчётов
        peak_channel = 0, //канал пика
        last_checked_radio = 9696, //последний выбраный изотоп
        checked_radio, //выбранный изотоп в этом цикле измерений
        full_time = 0, //полное время измерения
        time = 1000, //время в текущем выборе измеренй
        plot,
        a = [],
        timeout,
        updateInterval = 800; //интервал обновления, мс

    // объект для параметров спектрометра
    var sp_params = function(){
      this.x_max = 1000;
      this.x_min = 0;
      this.y_max = 5000;
      this.y_min = 0;
      this.validate = function(){
        // if ((this.x_min < 0) || (IsNumber(this.x_min)) ){}
      };
    };

    var data = []; //массив для динамического обновления
    var spectrometr = $("#spectrometr");

    // нужно ли занулять массив при инициализации?
    buf_old.set_zero();

    $("#build").on('click', function () {
        // console.log("build start");
        var second_channel_of_photopeak = 0;
        spectrum_points.length = 0;

        sp_params.x_max = $("#x_max").val();
        sp_params.y_min = $("#y_min").val();
        sp_params.y_max = $("#y_max").val();

        time = $("#time").val(); //снимаем параметры

        //валидация параметров
        //

        var options = {
            series: {
                points: {show: true},
                shadowSize: 0
            },
            crosshair: {mode: "x"},
            grid: {
                hoverable: true,
                autoHighlight: true
            },
            yaxis: {
                min: -200,
                max: sp_params.y_max
            },
            xaxis: {
                min: sp_params.x_min,
                max: sp_params.x_max
            },
            selection: {
                mode: "x"
            },
            colors: ["#209a31"]
        };//параметры графика

        checked_radio = $('input[name="raz"]:checked').val(); //какой номер изотопа выбран

        if (checked_radio != last_checked_radio) {
            //если изменился изотоп, то зануляем параметры и пересчитываем аппаратную функцию
            second_channel_of_photopeak = 0;
            buf_old.set_zero();
            last_checked_radio = checked_radio;
            peak_channel = energy_to_channel(parseInt(checked_radio));
            spectrum_points.length = 0;
            full_time = 0;

            //аппаратная функция спектрометра
            a[1] = -1.38 * peak_channel + 4106;
            a[2] = 0.0004 * peak_channel + 0.279;
            a[3] = 0.9789 * peak_channel - 432;
            a[4] = 0.032 * peak_channel + 21.44;
            do
            a[5] = 12000*Math.random();
            while (a[5]<8000);
            a[6] = peak_channel;
            a[7] = 3;
            a[12] = 0;
            a[52] = 0;
        } //проверка обновления источника
        //если это изотоп с двойным пиком- добавляем точек
        if (checked_radio == 5) {
            second_channel_of_photopeak = energy_to_channel_double_peak(parseInt(checked_radio));
            a[12] = 1.38 * second_channel_of_photopeak - 4106;
            a[22] = 0.0004 * second_channel_of_photopeak + 0.279;
            a[32] = 0.9789 * second_channel_of_photopeak - 432;
            a[42] = 0.032 * second_channel_of_photopeak + 21.44;
            a[52] = 10000;
            a[62] = second_channel_of_photopeak;
            a[72] = 1;
        } //двойной распад

        for (var i = 0; i < 5000; i+= 1) {
            buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7], 100);
            if (second_channel_of_photopeak != 0) { //если это не 5 источник- добавляем ещё             один пик
                buf += calc(i, a[12], a[22], a[32], a[42], a[52], a[62], a[72], 100);
            }
            buf += buf_old[i] ;
            buf_old[i] = buf; //запомониаем у
            spectrum_points.push([i, buf]);
        } //вычисление 1ого шага

        plot = $.plot(spectrometr, [
            {data: spectrum_points, label: "spectr(x) = -0.00"},
        ],options); //рисуем первый шаг

        data.set_zero();

        function getSpectrumData() { //получаем значения спектра
            var res = [];
            for (var i = 0; i < 5000; i+= 1) {
                //i+= Math.floor(3*Math.random());
                buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7], 500);//посчитали шаг
                if (second_channel_of_photopeak != 0) { //если это не 5 источник- добавляем ещё один пик вылета          один пик
                    buf += calc(i, a[12], a[22], a[32], a[42], a[52], a[62], a[72], 500);
                }
                buf = buf + Puas(buf);  //зашумили шаг


                buf_old[i] += buf;  //к старому спектру добавили текущий шаг
                buf = buf_old[i];
                res.push([i, buf]);
                spectrum_points.push([i, buf]);
            }
            return res;

        } //обновление точек спектра
        var t = 0; //время текущего цикла( первый шаг уже посчитан)

        $("#full-time").text(full_time+" cек");
        function update() { //обновление графика

            if (t < time) {
                t += 100;
                full_time += 100;
                $("#full-time").text(full_time+" cек");
                plot = $.plot(spectrometr, [
                    {data: getSpectrumData(), label: "spectr(x) = -0.00"},
                ], options);
                $("#points-info").click();

                timeout = setTimeout(update, updateInterval);
            }
        }
        update();

        spectrometr.bind("plotunselected", function (event) {
            $("#selection").text("");
        });
        spectrometr.bind("plotselected", function (event, ranges) {

            $("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));

            var zoom = $("#squaredTwo").prop("checked");

            if (zoom) {
                $.each(plot.getXAxes(), function (_, axis) {
                    var opts = axis.options;
                    opts.min = ranges.xaxis.from;
                    opts.max = ranges.xaxis.to;
                });
                plot.setupGrid();
                plot.draw();
                plot.clearSelection();
                $("#points-info").trigger("click")
            }
        });
        ////////////////////

        $("#answer-field").slideDown();
        $("#warning-text").slideUp(); //окошки для ответов



        $("#points-info").trigger("click")
    });

    $("#points-info").click(function () {
        var legends = $("#spectrometr .legendLabel");
        legends.each(function () {
            // fix the widths so they don't jump around
            $(this).css('width', $(this).width());
        });
        var updateLegendTimeout = null;
        var latestPosition = null;
        function updateLegend() {
            updateLegendTimeout = null;
            var pos = latestPosition;
            var axes = plot.getAxes();
            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                return;
            }

            var i, j, dataset = plot.getData();
            for (i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                // Find the nearest points, x-wise

                for (j = 0; j < series.data.length; ++j) {
                    if (series.data[j][0] > pos.x) {
                        break;
                    }
                }

                // Now Interpolate

                var y,
                    p1 = series.data[j - 1],
                    p2 = series.data[j];

                if (p1 == null) {
                    y = p2[1];
                } else if (p2 == null) {
                    y = p1[1];
                } else {
                    y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                }


                legends.eq(i).text(series.label.replace(/spectr(.*)=.*/, "spectr(" + pos.x.toFixed(0)
                + ") = " + y.toFixed(0))); //заменяем поле информации канал(спектр)
            }
        }
        $("#spectrometr").bind("plothover",  function (event, pos, item) {
            latestPosition = pos;
            if (!updateLegendTimeout) {
                updateLegendTimeout = setTimeout(updateLegend, 50);
            }
        });

    });

    $("#clear").click(function () { //кнопка сброс
        clearTimeout(timeout);
        $("#answer-field").slideUp();
        $("#warning-text").slideUp();//прячем поля для ответов
        full_time = 0;
        $("#full-time").text('0 сек'); //убираем время измерений
        options = {
            series: {
                lines: {show: false}
            }

        }; //убираем график
        spectrum_points.length = 0; //зануляем массив с точками
        buf_old.set_zero(); //зануляем буффер с последними точками

        plot = $.plot(spectrometr, [
            {data: spectrum_points, label: "spectr(x) = -0.00"},
        ], options); //отрисовываем график

    });
};


$("#check").click(function () { // первая задача, проверка неизвестного источника
  var answer = $("#answer").val();

  var right_answer = calibration() * peak_channel;
  if ((answer > (right_answer - right_answer * 0.1)) && (answer < (right_answer + right_answer * 0.1))) {
      alert("верно");
  }
  else {
      alert("неверно");
  }
});


$(document).on('page:change', init)
