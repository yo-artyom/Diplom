class CreateGammaSources < ActiveRecord::Migration
  def change
    create_table :gamma_sources do |t|
      t.string :name
      t.float :peak_energy
      t.boolean :double_peak , default: false
      t.float :second_peak_energy
      t.timestamps null: false
    end
  end
end
