require 'rails_helper'

RSpec.describe Expense, type: :model do
  let(:category) { Category.create!(name: "Food") }

  it "is invalid when the expense date is in the future" do
    expense = Expense.new(
      description: "Future purchase",
      amount: 100,
      category: category,
      date: Date.current + 1.day
    )

    expect(expense).not_to be_valid
    expect(expense.errors[:date]).to include("cannot be in the future")
  end
end
