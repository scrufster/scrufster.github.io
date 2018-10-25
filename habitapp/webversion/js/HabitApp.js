HabitApp = function(args)
{
    this.myImage = null;

    //This is where the output image will appear, with the cut-off applied:
    this.canvas_Result = args.canvas_Result;
    this.ctx_Result = this.canvas_Result.getContext('2d');

    //The result will be displayed here:
    this.coverageResultOutput = args.coverageResultOutput;

    //The original canvas stores the image in its unmodified form:
    this.canvas_Original = null;

    //Depending on the arguments, this may or may not be displayed to the user:
    if (args.canvas_Original)
    {
        this.canvas_Original = args.canvas_Original;
    }
    else
    {
        this.canvas_Original = document.createElement('canvas');
    }

    this.ctx_Original = this.canvas_Original.getContext('2d');

    //The slider controls the cut-off value. Changing it updates the image:
    this.slider = args.slider;

    this.cutOffValue = args.cutOffValue;

    //The percentage cover:
    this.percentage = 0;
    
    //Initialise UI output:
    this.updateCutOff();
    this.updatePercentageCover();

    var context = this;
    this.slider.addEventListener("change", function ()
    {
        context.updateCutOff();
        context.updateImage();
    });
}

HabitApp.prototype = 
{
    setImage: function(path)
    {
        var context = this;

        var image = new Image();
        image.onload = function ()
        {
            //Size the internal canvas for this image:
            context.canvas_Original.width = image.width;
            context.canvas_Original.height = image.height;

            //Ensure that the displayed canvas is the same size:
            context.canvas_Result.width = image.width;
            context.canvas_Result.height = image.height;

            //Draw the image to the internal canvas:
            context.ctx_Original.drawImage(image, 0, 0);

            ////Could make this toggleable:
            //context.canvas_Original.style.display = "none";

            //Store the image:
            context.myImage = image;

            //Apply the settings:
            context.updateImage();
        }

        image.src = path;
    },
    
    updateCutOff: function ()
    {
        this.cutOffValue.innerText = this.slider.value;
    },

    updateImage: function ()
    {
        if (this.myImage != null)
        {
            var imageData = this.ctx_Original.getImageData(0, 0, this.myImage.width, this.myImage.height);
            var pixels = imageData.data;
            
            var bwCutOff = this.slider.value;

            //Each pixel is represented by 4 entries in the array (RGBA), so the
            //total number of pixels is calculated here:
            var totalPixels = pixels.length / 4.0;

            var blackPixelCount = 0;

            for (var i = 0; i < pixels.length; i += 4)
            {
                var r = pixels[i];
                var g = pixels[i + 1];
                var b = pixels[i + 2];

                if (r > bwCutOff || g > bwCutOff || b > bwCutOff)
                {
                    pixels[i] = 255;
                    pixels[i + 1] = 255;
                    pixels[i + 2] = 255;
                }
                else
                {
                    pixels[i] = 0;
                    pixels[i + 1] = 0;
                    pixels[i + 2] = 0;

                    blackPixelCount++;
                }
            }

            //Draw the modified image to the output canvas:
            this.ctx_Result.putImageData(imageData, 0, 0);

            this.percentage = (blackPixelCount / totalPixels) * 100;
            
            //Display the result:
            this.updatePercentageCover();
        }
    },
    
    updatePercentageCover: function ()
    {
        this.coverageResultOutput.innerText = Math.round(this.percentage) + "%";
    }
}