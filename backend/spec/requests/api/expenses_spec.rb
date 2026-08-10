require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food") }
  let!(:transport_category) { Category.create!(name: "Transport") }

  describe "GET /api/expenses" do
    let!(:expense1) do
      Expense.create!(
        description: "Older expense date, newer creation time",
        amount: 100.00,
        category: food_category,
        date: Date.new(2026, 8, 1),
        created_at: Time.zone.local(2026, 8, 10, 12, 0, 0),
        updated_at: Time.zone.local(2026, 8, 10, 12, 0, 0)
      )
    end

    let!(:expense2) do
      Expense.create!(
        description: "Newer expense date, older creation time",
        amount: 50.00,
        category: transport_category,
        date: Date.new(2026, 8, 10),
        created_at: Time.zone.local(2026, 8, 1, 12, 0, 0),
        updated_at: Time.zone.local(2026, 8, 1, 12, 0, 0)
      )
    end

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "returns expenses in descending order by expense date" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(expense2.id)
      expect(json.last["id"]).to eq(expense1.id)
    end

    it "filters expenses by expense date month rather than creation time" do
      july_expense = Expense.create!(
        description: "Created in August, dated in July",
        amount: 75.00,
        category: food_category,
        date: Date.new(2026, 7, 15),
        created_at: Time.zone.local(2026, 8, 10, 8, 0, 0),
        updated_at: Time.zone.local(2026, 8, 10, 8, 0, 0)
      )

      get "/api/expenses", params: { year: 2026, month: 7 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.map { |expense| expense["id"] }).to eq([july_expense.id])
    end
  end

  describe "POST /api/expenses" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          expense: {
            description: "Team Lunch",
            amount: 150.50,
            category_id: food_category.id,
            date: Date.today
          }
        }
      end

      it "creates a new expense" do
        expect {
          post "/api/expenses", params: valid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to eq(150.5)
      end
    end

    context "with invalid parameters" do
      it "with negative amounts" do
        invalid_params = {
          expense: {
            description: "Invalid expense",
            amount: -100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with empty descriptions" do
        invalid_params = {
          expense: {
            description: "",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end
  end
end
