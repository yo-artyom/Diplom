class MainController < ApplicationController
  def experiment
    @sources = GammaSource.all
  end
end
