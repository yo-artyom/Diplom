class GammaSource < ActiveRecord::Base
  validates :name, :peak_energy, presence: true
  validates :second_peak_energy, presence: true, if: :double_peak
end
