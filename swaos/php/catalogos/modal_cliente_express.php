   <!-- Modal para crear un cliente express -->
   <div id="modalClienteExpress" class="modal" style="display: none; z-index: 2000; background-color: rgba(0,0,0,0.85);">
     <div class="modal-contentProductos" style="max-width: 500px; margin-top: 10%;">
       <span class="close" onclick="cerrarModalClienteExpress()">&times;</span>
       <h3 class="tittle">Nuevo Cliente Rápido</h3>

       <form id="form-cliente-express" novalidate>
         <div class="form-group">
           <label>Nombre:</label>
           <input type="text" name="nombre" required autocomplete="off">
         </div>

         <div class="form-group">
           <label>Primer Apellido:</label>
           <input type="text" name="apellido" required autocomplete="off">
         </div>

         <div class="form-group">
           <label>Teléfono (WhatsApp):</label>
           <input type="text" name="telefono" required pattern="[0-9]+" title="Solo números" maxlength="10" autocomplete="off">
         </div>

         <div class="form-group">
           <label>Email (Opcional):</label>
           <input type="email" name="email" autocomplete="off">
         </div>

         <div style="text-align: right; margin-top: 15px;">
           <button type="submit" class="boton-guardar">Guardar y Seleccionar</button>
           <span class="cancelarModal" onclick="cerrarModalClienteExpress()">Cancelar</span>
         </div>
       </form>
     </div>
   </div>