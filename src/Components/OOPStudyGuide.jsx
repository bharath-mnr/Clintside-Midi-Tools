import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Book, Code, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

const OOPStudyGuide = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('foundations');
  const [completedTopics, setCompletedTopics] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleComplete = (topicId) => {
    setCompletedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const Section = ({ id, title, children, icon: Icon }) => {
    const isExpanded = expandedSections[id];
    const isComplete = completedTopics[id];
    
    return (
      <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        <div className="flex items-center">
          <button
            onClick={() => toggleSection(id)}
            className="flex-1 px-6 py-4 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 text-blue-400" />}
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </button>
          <button
            onClick={() => toggleComplete(id)}
            className={`px-4 py-4 ${isComplete ? 'text-green-400' : 'text-gray-600'} hover:text-green-300 transition-colors`}
            title={isComplete ? "Mark as incomplete" : "Mark as complete"}
          >
            <CheckCircle className="w-6 h-6" fill={isComplete ? "currentColor" : "none"} />
          </button>
        </div>
        {isExpanded && (
          <div className="px-6 py-4 bg-gray-900">
            {children}
          </div>
        )}
      </div>
    );
  };

  const CodeBlock = ({ code }) => (
    <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto border border-gray-700 my-3">
      <code className="text-sm text-green-400 whitespace-pre">{code}</code>
    </pre>
  );

  const Note = ({ children, type = "info" }) => {
    const colors = {
      info: "border-blue-500 bg-blue-950 text-blue-200",
      warning: "border-yellow-500 bg-yellow-950 text-yellow-200",
      tip: "border-green-500 bg-green-950 text-green-200",
      key: "border-purple-500 bg-purple-950 text-purple-200"
    };
    return (
      <div className={`border-l-4 p-4 my-3 rounded-r ${colors[type]}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{children}</div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'foundations', label: '🏗️ Foundations', count: 5 },
    { id: 'pillars', label: '🏛️ Four Pillars', count: 4 },
    { id: 'advanced', label: '🚀 Advanced', count: 6 },
    { id: 'design', label: '🎨 Design', count: 3 }
  ];

  const completedCount = Object.values(completedTopics).filter(Boolean).length;
  const totalTopics = 18;
  const progressPercent = Math.round((completedCount / totalTopics) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            OOP Mastery Guide
          </h1>
          <p className="text-lg text-gray-400 mb-4">Your Complete Java Object-Oriented Programming Reference</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progress: {completedCount}/{totalTopics} topics</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FOUNDATIONS TAB */}
        {activeTab === 'foundations' && (
          <div className="space-y-4">
            <Section id="oop-intro" title="What is OOP?" icon={Book}>
              <p className="text-gray-300 mb-4">
                <strong className="text-blue-400">Object-Oriented Programming</strong> is a programming paradigm centered around <strong>objects</strong> that contain both data (attributes) and code (methods).
              </p>
              
              <Note type="key">
                <strong>Core Concept:</strong> Model real-world entities as objects with properties and behaviors.
                <br/>Example: A <code>Car</code> object has properties (color, model) and behaviors (accelerate, brake).
              </Note>

              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Key Benefits:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>✅ <strong>Modularity:</strong> Break code into reusable pieces</li>
                  <li>✅ <strong>Reusability:</strong> Use existing code in new programs</li>
                  <li>✅ <strong>Maintainability:</strong> Easier to update and fix</li>
                  <li>✅ <strong>Flexibility:</strong> Adapt to changing requirements</li>
                </ul>
              </div>
            </Section>

            <Section id="classes-objects" title="Classes & Objects" icon={Code}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Class = Blueprint</h4>
                  <p className="text-gray-300">A template that defines structure and behavior</p>
                </div>

                <CodeBlock code={`public class Car {
    // Attributes (instance variables)
    private String brand;
    private String model;
    private double speed;
    
    // Constructor - initializes object
    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
        this.speed = 0.0;
    }
    
    // Methods (behaviors)
    public void accelerate(double amount) {
        speed += amount;
        System.out.println(brand + " speed: " + speed);
    }
    
    public void brake() {
        speed = 0;
    }
}`} />

                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Object = Instance</h4>
                  <p className="text-gray-300 mb-2">Actual entity created from the class</p>
                </div>

                <CodeBlock code={`// Creating objects
Car myCar = new Car("Toyota", "Camry");
Car yourCar = new Car("Honda", "Accord");

myCar.accelerate(60);  // Toyota speed: 60.0
yourCar.accelerate(80); // Honda speed: 80.0`} />

                <Note type="info">
                  <strong>Remember:</strong>
                  <ul className="list-disc ml-5 mt-2">
                    <li>Class is logical/template; Object is physical/actual</li>
                    <li>One class → many objects</li>
                    <li>Each object has its own data copy</li>
                  </ul>
                </Note>
              </div>
            </Section>

            <Section id="constructors" title="Constructors" icon={Code}>
              <p className="text-gray-300 mb-3">Special methods that initialize objects. Same name as class, no return type.</p>

              <CodeBlock code={`public class Student {
    private String name;
    private int id;
    private double gpa;
    
    // 1. Default Constructor (Java provides if you don't)
    public Student() {
        name = "Unknown";
        id = 0;
        gpa = 0.0;
    }
    
    // 2. Parameterized Constructor
    public Student(String name, int id) {
        this.name = name;
        this.id = id;
        this.gpa = 0.0;
    }
    
    // 3. Overloaded Constructor
    public Student(String name, int id, double gpa) {
        this.name = name;
        this.id = id;
        this.gpa = gpa;
    }
    
    // 4. Copy Constructor
    public Student(Student other) {
        this.name = other.name;
        this.id = other.id;
        this.gpa = other.gpa;
    }
}

// Usage
Student s1 = new Student();
Student s2 = new Student("Alice", 101);
Student s3 = new Student("Bob", 102, 3.8);
Student s4 = new Student(s3); // Copy of s3`} />

              <Note type="warning">
                <strong>Important:</strong> If you define ANY constructor, Java won't provide the default one. Define it explicitly if needed!
              </Note>
            </Section>

            <Section id="this-keyword" title="'this' Keyword" icon={Lightbulb}>
              <p className="text-gray-300 mb-3">Refers to the current object instance.</p>

              <CodeBlock code={`public class Person {
    private String name;
    private int age;
    
    // 1. Distinguish parameter from instance variable
    public Person(String name, int age) {
        this.name = name;  // this.name = instance var
        this.age = age;    // name/age = parameters
    }
    
    // 2. Call another constructor
    public Person(String name) {
        this(name, 0);  // Calls Person(String, int)
    }
    
    // 3. Return current object (method chaining)
    public Person setName(String name) {
        this.name = name;
        return this;
    }
    
    public Person setAge(int age) {
        this.age = age;
        return this;
    }
}

// Method chaining
Person p = new Person("John")
    .setName("John Doe")
    .setAge(25);`} />
            </Section>

            <Section id="static-vs-instance" title="Static vs Instance" icon={Code}>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-700 px-4 py-2 text-left text-blue-400">Aspect</th>
                      <th className="border border-gray-700 px-4 py-2 text-left text-green-400">Instance</th>
                      <th className="border border-gray-700 px-4 py-2 text-left text-purple-400">Static</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="border border-gray-700 px-4 py-2 font-semibold">Belongs to</td>
                      <td className="border border-gray-700 px-4 py-2">Object</td>
                      <td className="border border-gray-700 px-4 py-2">Class</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 px-4 py-2 font-semibold">Memory</td>
                      <td className="border border-gray-700 px-4 py-2">Separate for each object</td>
                      <td className="border border-gray-700 px-4 py-2">Shared by all objects</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 px-4 py-2 font-semibold">Access</td>
                      <td className="border border-gray-700 px-4 py-2">obj.method()</td>
                      <td className="border border-gray-700 px-4 py-2">ClassName.method()</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 px-4 py-2 font-semibold">Can access</td>
                      <td className="border border-gray-700 px-4 py-2">Both static & instance</td>
                      <td className="border border-gray-700 px-4 py-2">Only static members</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeBlock code={`public class Counter {
    private int instanceCount = 0;      // Instance
    private static int staticCount = 0; // Static (shared)
    
    public Counter() {
        instanceCount++;
        staticCount++;
    }
    
    public void showInstance() {
        System.out.println("Instance: " + instanceCount);
    }
    
    public static void showStatic() {
        System.out.println("Static: " + staticCount);
        // Can't access instanceCount here!
    }
}

Counter c1 = new Counter();
Counter c2 = new Counter();

c1.showInstance(); // Instance: 1
c2.showInstance(); // Instance: 1
Counter.showStatic(); // Static: 2`} />

              <Note type="tip">
                <strong>Use Static for:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li>Utility methods (Math.sqrt(), Arrays.sort())</li>
                  <li>Constants (Math.PI, Integer.MAX_VALUE)</li>
                  <li>Counters tracking all objects</li>
                </ul>
              </Note>
            </Section>
          </div>
        )}

        {/* FOUR PILLARS TAB */}
        {activeTab === 'pillars' && (
          <div className="space-y-4">
            <Section id="encapsulation" title="1️⃣ Encapsulation" icon={Book}>
              <p className="text-gray-300 mb-3">
                <strong className="text-blue-400">Bundle data + methods</strong> into a class and <strong>restrict direct access</strong> to protect data.
              </p>

              <CodeBlock code={`public class BankAccount {
    // Private data (hidden)
    private String accountNumber;
    private double balance;
    private String pin;
    
    public BankAccount(String accountNumber, String pin) {
        this.accountNumber = accountNumber;
        this.pin = pin;
        this.balance = 0.0;
    }
    
    // Controlled access via public methods
    public double getBalance() {
        return balance;
    }
    
    public boolean deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            return true;
        }
        return false;
    }
    
    public boolean withdraw(double amount, String enteredPin) {
        if (!pin.equals(enteredPin)) {
            return false; // Wrong PIN
        }
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
}

// Usage
BankAccount acc = new BankAccount("ACC123", "1234");
acc.deposit(1000);
// acc.balance = 9999; // ERROR! Can't access private
acc.withdraw(500, "1234"); // OK with correct PIN`} />

              <Note type="tip">
                <strong>Benefits:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li>🔒 Data hiding & security</li>
                  <li>✅ Validation & control</li>
                  <li>🔄 Easy to change implementation</li>
                  <li>📖 Read-only/write-only properties</li>
                </ul>
              </Note>
            </Section>

            <Section id="inheritance" title="2️⃣ Inheritance" icon={Code}>
              <p className="text-gray-300 mb-3">
                <strong className="text-blue-400">Child class inherits</strong> properties and methods from parent class. Promotes code reuse.
              </p>

              <CodeBlock code={`// Parent class
class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
    
    public void makeSound() {
        System.out.println("Generic sound");
    }
}

// Child class
class Dog extends Animal {
    private String breed;
    
    public Dog(String name, int age, String breed) {
        super(name, age); // Call parent constructor
        this.breed = breed;
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + " barks: Woof!");
    }
    
    public void fetch() {
        System.out.println(name + " is fetching");
    }
}

// Usage
Dog dog = new Dog("Buddy", 3, "Labrador");
dog.eat();       // Inherited from Animal
dog.makeSound(); // Overridden: Buddy barks: Woof!
dog.fetch();     // Dog-specific method`} />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Types of Inheritance</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Single: A → B</li>
                    <li>• Multilevel: A → B → C</li>
                    <li>• Hierarchical: A → B, A → C</li>
                    <li>• Multiple: ❌ Not in Java (use interfaces)</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Key Points</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Use <code>super</code> for parent access</li>
                    <li>• IS-A relationship</li>
                    <li>• Private members not inherited</li>
                    <li>• Constructor chaining with super()</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="polymorphism" title="3️⃣ Polymorphism" icon={Lightbulb}>
              <p className="text-gray-300 mb-3">
                <strong className="text-blue-400">"Many forms"</strong> - Same interface, different implementations.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Compile-Time: Method Overloading</h4>
                  <p className="text-gray-300 text-sm mb-2">Same method name, different parameters in SAME class</p>
                  
                  <CodeBlock code={`class Calculator {
    // Different number of parameters
    public int add(int a, int b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
    
    // Different types
    public double add(double a, double b) {
        return a + b;
    }
}

Calculator calc = new Calculator();
calc.add(5, 10);      // Calls add(int, int)
calc.add(5, 10, 15);  // Calls add(int, int, int)
calc.add(5.5, 10.5);  // Calls add(double, double)`} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Runtime: Method Overriding</h4>
                  <p className="text-gray-300 text-sm mb-2">Child redefines parent method, decided at runtime</p>
                  
                  <CodeBlock code={`class Shape {
    public void draw() {
        System.out.println("Drawing shape");
    }
}

class Circle extends Shape {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}

class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Drawing rectangle");
    }
}

// Polymorphism in action
Shape s1 = new Circle();
Shape s2 = new Rectangle();

s1.draw(); // Drawing circle (runtime decision)
s2.draw(); // Drawing rectangle (runtime decision)`} />
                </div>

                <Note type="key">
                  <strong>Key Difference:</strong>
                  <ul className="list-disc ml-5 mt-2">
                    <li><strong>Overloading:</strong> Same class, compile-time</li>
                    <li><strong>Overriding:</strong> Parent-child, runtime</li>
                  </ul>
                </Note>
              </div>
            </Section>

            <Section id="abstraction" title="4️⃣ Abstraction" icon={Code}>
              <p className="text-gray-300 mb-3">
                <strong className="text-blue-400">Hide implementation</strong>, show only essential features.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Abstract Class</h4>
                  <p className="text-gray-300 text-sm mb-2">Cannot instantiate. Mix of abstract and concrete methods.</p>
                  
                  <CodeBlock code={`abstract class Vehicle {
    protected String brand;
    
    public Vehicle(String brand) {
        this.brand = brand;
    }
    
    // Abstract (no body)
    public abstract void start();
    public abstract void stop();
    
    // Concrete (has body)
    public void displayInfo() {
        System.out.println("Brand: " + brand);
    }
}

class Car extends Vehicle {
    public Car(String brand) {
        super(brand);
    }
    
    @Override
    public void start() {
        System.out.println(brand + " engine started");
    }
    
    @Override
    public void stop() {
        System.out.println(brand + " engine stopped");
    }
}

// Vehicle v = new Vehicle("X"); // ERROR!
Vehicle car = new Car("Toyota"); // OK
car.start();`} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Interface</h4>
                  <p className="text-gray-300 text-sm mb-2">Pure abstraction. All methods abstract (pre-Java 8). Multiple implementation allowed!</p>
                  
                  <CodeBlock code={`interface Flyable {
    void fly();
    void land();
}

interface Swimmable {
    void swim();
}

// Implement multiple interfaces!
class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("Duck flying");
    }
    
    @Override
    public void land() {
        System.out.println("Duck landing");
    }
    
    @Override
    public void swim() {
        System.out.println("Duck swimming");
    }
}

Duck duck = new Duck();
duck.fly();
duck.swim();`} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-700 px-3 py-2 text-left">Feature</th>
                        <th className="border border-gray-700 px-3 py-2 text-left text-green-400">Abstract Class</th>
                        <th className="border border-gray-700 px-3 py-2 text-left text-purple-400">Interface</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr>
                        <td className="border border-gray-700 px-3 py-2">Methods</td>
                        <td className="border border-gray-700 px-3 py-2">Abstract + Concrete</td>
                        <td className="border border-gray-700 px-3 py-2">Abstract only*</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-700 px-3 py-2">Variables</td>
                        <td className="border border-gray-700 px-3 py-2">Any type</td>
                        <td className="border border-gray-700 px-3 py-2">Constants only</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-700 px-3 py-2">Constructor</td>
                        <td className="border border-gray-700 px-3 py-2">✅ Yes</td>
                        <td className="border border-gray-700 px-3 py-2">❌ No</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-700 px-3 py-2">Multiple?</td>
                        <td className="border border-gray-700 px-3 py-2">❌ Extend one</td>
                        <td className="border border-gray-700 px-3 py-2">✅ Implement many</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-700 px-3 py-2">Use when</td>
                        <td className="border border-gray-700 px-3 py-2">Related classes (IS-A)</td>
                        <td className="border border-gray-700 px-3 py-2">Capabilities (CAN-DO)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">* Java 8+ allows default/static methods in interfaces</p>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <Section id="final-keyword" title="'final' Keyword" icon={Book}>
              <p className="text-gray-300 mb-3">Restricts modification - apply to variables, methods, and classes.</p>

              <CodeBlock code={`// 1. Final Variable (constant)
final int MAX_SIZE = 100;
// MAX_SIZE = 200; // ERROR!

// 2. Final Method (can't override)
class Parent {
    public final void important() {
        System.out.println("Cannot override this");
    }
}

class Child extends Parent {
    // @Override
    // public void important() { } // ERROR!
}

// 3. Final Class (can't inherit)
final class ImmutableClass {
    private final int value;
    
    public ImmutableClass(int value) {
        this.value = value;
    }
}

// class Sub extends ImmutableClass { } // ERROR!`} />

              <Note type="tip">
                <strong>Use final for:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li>🔒 Constants that never change</li>
                  <li>🛡️ Security (prevent method override)</li>
                  <li>⚡ Performance (compiler optimization)</li>
                  <li>🧊 Immutability (like String class)</li>
                </ul>
              </Note>
            </Section>

            <Section id="inner-classes" title="Inner & Nested Classes" icon={Code}>
              <p className="text-gray-300 mb-3">Classes defined within other classes. Four types.</p>

              <CodeBlock code={`// 1. Member Inner Class (non-static)
class Outer {
    private int outerValue = 100;
    
    class Inner {
        public void display() {
            System.out.println("Outer: " + outerValue);
        }
    }
}

// Usage: outer.new Inner()
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();

// 2. Static Nested Class
class OuterStatic {
    private static int value = 100;
    
    static class Nested {
        public void show() {
            System.out.println(value);
        }
    }
}

// Usage: No outer object needed
OuterStatic.Nested nested = new OuterStatic.Nested();

// 3. Local Inner Class (inside method)
class LocalOuter {
    public void method() {
        final int local = 10;
        
        class LocalInner {
            public void display() {
                System.out.println(local);
            }
        }
        
        LocalInner li = new LocalInner();
        li.display();
    }
}

// 4. Anonymous Inner Class
interface Greeting {
    void greet();
}

Greeting g = new Greeting() {
    @Override
    public void greet() {
        System.out.println("Hello!");
    }
};`} />

              <Note type="info">
                <strong>Use Cases:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li><strong>Member Inner:</strong> Helper classes (LinkedList.Node)</li>
                  <li><strong>Static Nested:</strong> Grouping (Builder pattern)</li>
                  <li><strong>Local:</strong> One-time use in method</li>
                  <li><strong>Anonymous:</strong> Event handlers, callbacks</li>
                </ul>
              </Note>
            </Section>

            <Section id="object-class" title="The Object Class" icon={Lightbulb}>
              <p className="text-gray-300 mb-3">Every class implicitly extends <code className="text-green-400">Object</code>. Key methods to override.</p>

              <CodeBlock code={`public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 1. toString() - String representation
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
    
    // 2. equals() - Compare objects
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) 
            return false;
        
        Person person = (Person) obj;
        return age == person.age && 
               name.equals(person.name);
    }
    
    // 3. hashCode() - MUST override with equals()
    @Override
    public int hashCode() {
        int result = name.hashCode();
        result = 31 * result + age;
        return result;
    }
}

// Usage
Person p1 = new Person("Alice", 25);
Person p2 = new Person("Alice", 25);

System.out.println(p1);            // Person{name='Alice', age=25}
System.out.println(p1 == p2);      // false (different objects)
System.out.println(p1.equals(p2)); // true (same content)
System.out.println(p1.hashCode() == p2.hashCode()); // true`} />

              <Note type="warning">
                <strong>equals() & hashCode() Contract:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li>If equals() returns true → hashCode() MUST be same</li>
                  <li>Always override both together</li>
                  <li>Critical for HashMap, HashSet</li>
                </ul>
              </Note>
            </Section>

            <Section id="instanceof-casting" title="instanceof & Type Casting" icon={Code}>
              <CodeBlock code={`class Animal { }
class Dog extends Animal {
    public void bark() {
        System.out.println("Woof!");
    }
}
class Cat extends Animal {
    public void meow() {
        System.out.println("Meow!");
    }
}

// Upcasting (automatic)
Animal animal1 = new Dog(); // Dog → Animal

// Downcasting (manual, check first!)
if (animal1 instanceof Dog) {
    Dog dog = (Dog) animal1;
    dog.bark(); // Now can bark
}

// Safe check before casting
Animal animal2 = new Cat();
if (animal2 instanceof Dog) {
    Dog wrongCast = (Dog) animal2; // Won't execute
} else {
    System.out.println("Not a dog!");
}

// Java 16+ Pattern Matching
if (animal2 instanceof Cat c) {
    c.meow(); // Automatically cast!
}

// instanceof with null
Animal nullAnimal = null;
System.out.println(nullAnimal instanceof Dog); // false`} />
            </Section>

            <Section id="generics" title="Generics - Type Parameters" icon={Lightbulb}>
              <p className="text-gray-300 mb-3">Type safety at compile-time. Eliminate casting.</p>

              <CodeBlock code={`// WITHOUT Generics (old way)
class BoxOld {
    private Object item;
    public void set(Object item) { this.item = item; }
    public Object get() { return item; }
}

BoxOld box = new BoxOld();
box.set("Hello");
String str = (String) box.get(); // Manual casting!
box.set(100); // Can add anything
String wrong = (String) box.get(); // Runtime ERROR!

// WITH Generics (type-safe)
class Box<T> {
    private T item;
    public void set(T item) { this.item = item; }
    public T get() { return item; }
}

Box<String> strBox = new Box<>();
strBox.set("Hello");
String s = strBox.get(); // No casting!
// strBox.set(100); // Compile ERROR - type-safe!

Box<Integer> intBox = new Box<>();
intBox.set(100);

// Multiple type parameters
class Pair<K, V> {
    private K key;
    private V value;
    
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
}

Pair<String, Integer> pair = new Pair<>("Age", 25);

// Generic Methods
public static <T> void printArray(T[] array) {
    for (T element : array) {
        System.out.println(element);
    }
}

Integer[] nums = {1, 2, 3};
String[] words = {"A", "B", "C"};
printArray(nums);
printArray(words);

// Bounded Type Parameters
class NumericBox<T extends Number> {
    private T value;
    
    public double getDouble() {
        return value.doubleValue();
    }
}

NumericBox<Integer> intBox2 = new NumericBox<>();
NumericBox<Double> doubleBox = new NumericBox<>();
// NumericBox<String> strBox2 = new NumericBox<>(); // ERROR!`} />

              <Note type="tip">
                <strong>Key Points:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li>Type erasure at runtime (backward compatibility)</li>
                  <li>Can't use primitives (use wrappers)</li>
                  <li>Can't create generic arrays</li>
                  <li>PECS: Producer Extends, Consumer Super</li>
                </ul>
              </Note>
            </Section>

            <Section id="enum" title="Enums - Type-Safe Constants" icon={Code}>
              <CodeBlock code={`// Basic Enum
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, 
    FRIDAY, SATURDAY, SUNDAY
}

Day today = Day.MONDAY;

// Switch with enum
switch (today) {
    case MONDAY:
        System.out.println("Start of week");
        break;
    case FRIDAY:
        System.out.println("TGIF!");
        break;
}

// Enum with fields & methods
enum Planet {
    EARTH(5.976e24, 6.37814e6),
    MARS(6.421e23, 3.3972e6);
    
    private final double mass;
    private final double radius;
    
    // Constructor (always private)
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }
    
    public double getMass() { return mass; }
    
    public double surfaceGravity() {
        final double G = 6.673e-11;
        return G * mass / (radius * radius);
    }
}

Planet earth = Planet.EARTH;
System.out.println(earth.getMass());
System.out.println(earth.surfaceGravity());

// Useful methods
Day[] allDays = Day.values();        // Get all
Day parsed = Day.valueOf("MONDAY");  // String to enum
int position = Day.MONDAY.ordinal(); // Position (0)`} />
            </Section>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            <Section id="solid" title="SOLID Principles" icon={Book}>
              <p className="text-gray-300 mb-4">Five design principles for maintainable OOP code.</p>

              <div className="space-y-6">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">1. Single Responsibility (SRP)</h4>
                  <p className="text-gray-300 text-sm mb-2">A class should have ONE reason to change</p>
                  
                  <CodeBlock code={`// BAD - Multiple responsibilities
class User {
    public void saveToDatabase() { }
    public void sendEmail() { }
    public void generateReport() { }
}

// GOOD - Single responsibility each
class User { /* data only */ }
class UserRepository { 
    public void save(User user) { } 
}
class EmailService { 
    public void sendEmail(User user) { } 
}
class ReportGenerator { 
    public void generate(User user) { } 
}`} />
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">2. Open/Closed (OCP)</h4>
                  <p className="text-gray-300 text-sm mb-2">Open for extension, closed for modification</p>
                  
                  <CodeBlock code={`// BAD - Must modify for new shapes
class AreaCalc {
    public double calc(Object shape) {
        if (shape instanceof Circle) { }
        else if (shape instanceof Rectangle) { }
        // Add more if-else for new shapes!
    }
}

// GOOD - Extend without modifying
interface Shape {
    double calculateArea();
}

class Circle implements Shape {
    public double calculateArea() {
        return Math.PI * r * r;
    }
}

class Rectangle implements Shape {
    public double calculateArea() {
        return w * h;
    }
}

// Add new shape - no modification needed!
class Triangle implements Shape {
    public double calculateArea() {
        return 0.5 * b * h;
    }
}`} />
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">3. Liskov Substitution (LSP)</h4>
                  <p className="text-gray-300 text-sm mb-2">Subclasses should be substitutable for parent</p>
                  
                  <CodeBlock code={`// BAD - Violates LSP
class Bird {
    public void fly() { }
}

class Penguin extends Bird {
    public void fly() {
        throw new Exception("Can't fly!"); // Breaks contract
    }
}

// GOOD - Follows LSP
interface Bird {
    void eat();
}

interface FlyingBird extends Bird {
    void fly();
}

class Sparrow implements FlyingBird {
    public void eat() { }
    public void fly() { }
}

class Penguin implements Bird {
    public void eat() { }
    public void swim() { }
}`} />
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">4. Interface Segregation (ISP)</h4>
                  <p className="text-gray-300 text-sm mb-2">Don't force clients to depend on unused methods</p>
                  
                  <CodeBlock code={`// BAD - Fat interface
interface Worker {
    void work();
    void eat();
    void sleep();
}

class Robot implements Worker {
    public void work() { }
    public void eat() { } // Forced to implement!
    public void sleep() { } // Forced to implement!
}

// GOOD - Segregated interfaces
interface Workable { void work(); }
interface Eatable { void eat(); }
interface Sleepable { void sleep(); }

class Human implements Workable, Eatable, Sleepable {
    public void work() { }
    public void eat() { }
    public void sleep() { }
}

class Robot implements Workable {
    public void work() { } // Only what's needed
}`} />
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-red-400 mb-2">5. Dependency Inversion (DIP)</h4>
                  <p className="text-gray-300 text-sm mb-2">Depend on abstractions, not concretions</p>
                  
                  <CodeBlock code={`// BAD - Depends on concrete class
class UserService {
    private MySQLDatabase db = new MySQLDatabase();
    
    public void save(User user) {
        db.save(user); // Tight coupling
    }
}

// GOOD - Depends on abstraction
interface Database {
    void save(User user);
}

class MySQLDatabase implements Database {
    public void save(User user) { }
}

class MongoDatabase implements Database {
    public void save(User user) { }
}

class UserService {
    private Database db; // Abstraction
    
    public UserService(Database db) {
        this.db = db; // Dependency injection
    }
    
    public void save(User user) {
        db.save(user); // Flexible!
    }
}

// Usage - easy to switch!
UserService service1 = new UserService(new MySQLDatabase());
UserService service2 = new UserService(new MongoDatabase());`} />
                </div>
              </div>
            </Section>

            <Section id="composition-vs-inheritance" title="Composition vs Inheritance" icon={Lightbulb}>
              <p className="text-gray-300 mb-3">
                <strong>"Favor composition over inheritance"</strong> - Gang of Four
              </p>

              <CodeBlock code={`// INHERITANCE (tight coupling)
class Vehicle {
    public void start() { }
    public void stop() { }
}

class Car extends Vehicle {
    public void drive() {
        start();
        System.out.println("Driving");
    }
}
// Problem: Change Vehicle affects all subclasses!

// COMPOSITION (loose coupling)
class Engine {
    public void start() { }
    public void stop() { }
}

class MusicSystem {
    public void play() { }
}

class GPS {
    public void navigate(String dest) { }
}

class Car {
    private Engine engine;        // HAS-A
    private MusicSystem music;    // HAS-A
    private GPS gps;              // HAS-A
    
    public Car() {
        this.engine = new Engine();
        this.music = new MusicSystem();
        this.gps = new GPS();
    }
    
    public void drive() {
        engine.start();
        music.play();
        System.out.println("Driving");
    }
    
    public void navigateTo(String dest) {
        gps.navigate(dest);
    }
}

// Benefits:
// ✅ Easy to swap implementations
// ✅ Can change components at runtime
// ✅ More flexible than inheritance`} />

              <Note type="tip">
                <strong>When to use:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li><strong>Inheritance:</strong> True IS-A (Dog IS-A Animal)</li>
                  <li><strong>Composition:</strong> HAS-A (Car HAS-A Engine)</li>
                  <li>💡 Default to composition for flexibility</li>
                </ul>
              </Note>
            </Section>

            <Section id="design-patterns" title="Common Design Patterns" icon={Code}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">1. Singleton Pattern</h4>
                  <p className="text-gray-300 text-sm mb-2">Ensure only one instance exists</p>
                  
                  <CodeBlock code={`public class Database {
    private static volatile Database instance;
    
    // Private constructor
    private Database() {
        System.out.println("DB initialized");
    }
    
    // Thread-safe getInstance
    public static Database getInstance() {
        if (instance == null) {
            synchronized (Database.class) {
                if (instance == null) {
                    instance = new Database();
                }
            }
        }
        return instance;
    }
    
    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }
}

// Usage
Database db1 = Database.getInstance();
Database db2 = Database.getInstance();
System.out.println(db1 == db2); // true - same instance`} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">2. Factory Pattern</h4>
                  <p className="text-gray-300 text-sm mb-2">Create objects without specifying exact class</p>
                  
                  <CodeBlock code={`interface Shape {
    void draw();
}

class Circle implements Shape {
    public void draw() {
        System.out.println("Drawing Circle");
    }
}

class Rectangle implements Shape {
    public void draw() {
        System.out.println("Drawing Rectangle");
    }
}

class ShapeFactory {
    public static Shape createShape(String type) {
        switch (type.toLowerCase()) {
            case "circle": return new Circle();
            case "rectangle": return new Rectangle();
            default: return null;
        }
    }
}

// Usage
Shape s1 = ShapeFactory.createShape("circle");
Shape s2 = ShapeFactory.createShape("rectangle");
s1.draw();
s2.draw();`} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">3. Builder Pattern</h4>
                  <p className="text-gray-300 text-sm mb-2">Construct complex objects step by step</p>
                  
                  <CodeBlock code={`class Pizza {
    private String size;
    private boolean cheese;
    private boolean pepperoni;
    private boolean bacon;
    
    private Pizza(Builder builder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.bacon = builder.bacon;
    }
    
    public static class Builder {
        private String size;
        private boolean cheese = false;
        private boolean pepperoni = false;
        private boolean bacon = false;
        
        public Builder(String size) {
            this.size = size;
        }
        
        public Builder cheese(boolean value) {
            cheese = value;
            return this;
        }
        
        public Builder pepperoni(boolean value) {
            pepperoni = value;
            return this;
        }
        
        public Builder bacon(boolean value) {
            bacon = value;
            return this;
        }
        
        public Pizza build() {
            return new Pizza(this);
        }
    }
}

// Usage - readable and flexible
Pizza pizza = new Pizza.Builder("Large")
    .cheese(true)
    .pepperoni(true)
    .bacon(false)
    .build();`} />
                </div>
              </div>

              <Note type="key">
                <strong>Pattern Benefits:</strong>
                <ul className="list-disc ml-5 mt-2">
                  <li><strong>Singleton:</strong> Single database connection</li>
                  <li><strong>Factory:</strong> Flexible object creation</li>
                  <li><strong>Builder:</strong> Complex object construction</li>
                </ul>
              </Note>
            </Section>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400 mb-2">
            📚 Study Tip: Check off topics as you master them!
          </p>
          <p className="text-sm text-gray-500">
            Practice writing code for each concept to solidify your understanding
          </p>
        </div>
      </div>
    </div>
  );
};

export default OOPStudyGuide;