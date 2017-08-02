using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TodoServer.Models;
using System.Threading.Tasks;
using System.Data.Entity;

namespace TodoServer.Controllers
{
    public class TodosController : Controller
    {
        ApplicationDbContext _dbContext;

        public TodosController()
        {
            _dbContext = new ApplicationDbContext();
        }

        // GET: Todos
        public async Task<ActionResult> Index()
        {
            ViewData["route"] = "index";
            return View(await _dbContext.TodoItems.ToListAsync());
        }

        public async Task<ActionResult> Completed()
        {
            ViewData["route"] = "completed";
            return View("Index", await _dbContext.TodoItems.ToListAsync());
        }

        public async Task<ActionResult> Remaining()
        {
            ViewData["route"] = "remaining";
            return View("Index", await _dbContext.TodoItems.ToListAsync());
        }

        public ActionResult ListJSON()
        {
            return Json(_dbContext.TodoItems.OrderBy(todo => todo.ID), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<ActionResult> Create(TodoItem todo)
        {
            todo.LastModified = DateTime.Now;
            _dbContext.TodoItems.Add(todo);
            await _dbContext.SaveChangesAsync();
            return Json(todo);
        }

        [HttpPost]
        public async Task<ActionResult> Update(int id, FormCollection fc)
        {
            var todo = await _dbContext.TodoItems.FirstAsync(x => x.ID == id);
            todo.LastModified = DateTime.Now;
            var contents = fc.GetValues("content");
            if (contents != null && contents.Length > 0)
            {
                var content = contents[0];
                todo.Content = content;
            }
            var doneValues = fc.GetValues("done");
            if (doneValues != null && doneValues.Length > 0)
            {
                var done = bool.Parse(doneValues[0]);
                todo.Done = done;
            }
            await _dbContext.SaveChangesAsync();
            return Json(todo);
        }

        [HttpPost]
        public async Task<ActionResult> Delete(int id)
        {
            var todo = await _dbContext.TodoItems.FirstAsync(x => x.ID == id);
            _dbContext.TodoItems.Remove(todo);
            await _dbContext.SaveChangesAsync();
            return Json(id);
        }

        [HttpPost]
        public async Task<ActionResult> MarkAll(bool done)
        {
            var todos = await _dbContext.TodoItems.Where(todo => todo.Done != done).ToListAsync();
            todos.ForEach(todo => { todo.Done = done; todo.LastModified = DateTime.Now; });
            await _dbContext.SaveChangesAsync();
            return Json(todos.Select(t => t.ID));
        }

        [HttpPost]
        public async Task<ActionResult> ClearCompleted()
        {
            var todos = await _dbContext.TodoItems.Where(todo => todo.Done).ToListAsync();
            todos.ForEach(todo => _dbContext.TodoItems.Remove(todo));
            await _dbContext.SaveChangesAsync();
            return Json(todos.Select(t => t.ID));
        }
    }
}