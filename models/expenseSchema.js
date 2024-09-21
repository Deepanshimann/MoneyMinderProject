const mongoose = require('mongoose');

// Schema for the Expense
const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    encrypted: {
        type: Boolean,
        default: false
      },
      passcode: {
        type: String
      },
      shareable: {
        type: Boolean,
        default: false
      }
    },{ timestamps: true
});

// Model for the expenses
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
