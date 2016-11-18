/*global define, console, alert*/
define(
		[ 'knockout',
         'text!./usuario.xhtml',
         'ModelBase',
         'jquery',
		'components/model/Usuario',
         'components/model/IdNameModel',
          'app/core/User',
        'components/model/Institucion',
        'toastr'],
		function(ko, templateMarkup, ModelBase, $, Usuario, IdNameModel,User,Institucion,toastr) {
			'use strict';

			function MantenedorUsuariosViewModel(params) {
				var self = this;
					this.usuario = ko.observable({}).ofType(Usuario);
				this.roles = ko.observable();
				//variables para visualizar input
        this.nomUsuario = ko.observable();
				this.nomUsuario2 = ko.observable();
				self.usuariosMatch = ko.observableArray([]).ofType(Usuario);
				this.nomFinal = ko.pureComputed({
					read: function () {
						return this.nomUsuario2();
					},
					write: function (value) {
						var lastSpacePos = value.lastIndexOf("");
						// Ignore values with no space character
						//if (lastSpacePos > 0) {
						//this.nomUsuario2(value.substring(0, lastSpacePos)); //update nombre
						this.nomUsuario2(value.substring(lastSpacePos + 1));
						//}
					},
					owner: this
				});
				//fin comentario
				this.comunas = ko.observable();
				this.usuarios = ko.observableArray([]).ofType(Usuario);
				this.loadComunas();
				//this.loadRoles();
				this.codInstitucion = User.roles()[0].idInstitucion() || '';

				this.loadUsuarios();
				this._usuario = ko.observable();
				this._persona = ko.observable();
				this.rut = ko.observable();
                this.enviarOk = ko.observable(true);
                self.configToastr();
                this.institucion = ko.observable({}).ofType(Institucion);
				this.rut.extend({
					rutValidation : self.rut,
					required : true
				});



        this.rutUser = ko.observable(User.rut());
				this.editarUsuario = ko.observable(false);
				this.idUsuarioSeleccionado = ko.computed(function() {
					if (self.usuario() && self.usuario().id
							&& self.usuario().id())
						return self.usuario().id();
					return -1;
				}, this);

				self.nomUsuario.subscribe(function (val) {
						if(val && self.usuarios()){
							for (var k = 0; k < self.usuarios().length; k++) {
								//console.log(self.usuarios()[k].nombres());
								if(self.usuarios()[k].nombres().toLowerCase().indexOf(val.toLowerCase()) > -1){
										self.usuariosMatch.push(self.usuarios()[k]);
										//console.log(self.usuarios()[k].nombres());
								}
							}
							for (var j=0; j < self.usuariosMatch().length; j++) {
								console.log(self.usuariosMatch()[j].nombres());
							}
							//console.log("bandera");
							//_.each(self.usuarios(), function (usr) {
									//if(usr.nombres() == val){
											//self.usuariosMatch().push(usr);
									//}
							//});
							//alert('The first element is ' + self.usuarios().length);
							alert('The length of usuariosMatch is ' + self.usuariosMatch().length + "valor de  val = " + val + " num de usuarios() = " + self.usuarios().length);
						}
						else {

						}
				});

				this.usuario().nombres = this.usuario().nombres.extend({
					required : true
				});
				this.usuario().apellidoPaterno = this.usuario().apellidoPaterno.extend({
					required : true
				});
				this.usuario().apellidoMaterno = this.usuario().apellidoMaterno.extend({
					required : true
				});
				this.usuario().usuario = this.usuario().usuario.extend({
					required : true
				});
				this.usuario().password = this.usuario().password.extend({
					required : true
				});
				this.usuario().email = this.usuario().email.extend({
					required : true,
					email : true
				});

				this.usuario().institucion().idInstitucion(User.roles()[0].idInstitucion);
				this.usuario().institucion().nombreInstitucion(User.roles()[0].nombreInstitucion);

				this.usuario().on("saved", function() {
					self.hideModalForm();
					self.loadUsuarios();
					self.usuario().clean();
					self.rut('');
					$('#modalSuccess').modal('show');
				});

				this.comuna = ko.observable();
				this.modal = ko.observable(false);
				this.valid = ko.computed(function() {
					return self.usuario().email.isValid()
							&& self.usuario().nombres.isValid()
							&& self.usuario().apellidoPaterno.isValid()
							&& self.usuario().apellidoMaterno.isValid()
							&& self.usuario().password.isValid();


				}, this);


                 this.validPassword = ko.computed(function() {
                   return self.usuario().password.isValid();
                }, this);




			}
			$.extend(MantenedorUsuariosViewModel.prototype, {

				showModalForm : function() {
					this.seleccionar(new Usuario({}), true);
					this.modal(true);
					$('#formPersona').modal('show');
				},
				showModalFormEdit : function() {
					this.modal(true);
					$('#formPersona').modal('show');
				},
				hideModalForm : function() {
					this.modal(false);
					$('#formPersona').modal('hide');
				},
				showModalError : function() {
					$('#modalError').modal('show');
				},
				showModalDeleteSuccess : function() {
					$('#modalDeleteSuccess').modal('show');
				},
				showModalUpdateSuccess : function() {
					$('#modalUpdateSuccess').modal('show');
				},
				showModalUpdateError : function() {
					$('#modalUpdateError').modal('show');
				},

				loadComunas : function() {
					var self = this;
					$.get("rest/parametro/comuna" + "?ts="
							+ new Date().getTime(), function(data) {
						self.comunas(data);
					});
				},
				/*
				loadRoles : function() {
					var self = this;
					$.get("rest/parametro/rol" + "?ts=" + new Date().getTime(),
							function(data) {
								self.roles(data);
							});
				},*/
				loadUsuarios : function() {
					var self = this;
					$.get("rest/usuario/list/" + this.codInstitucion  + "?ts=" + new Date().getTime(),
							function(data) {
								self.usuarios(data);
							});
				},
/*
				matchName : function(usr) {
					var self = this;
					if (usr.nombres() == self.nomUsuario()) {
						return true;
					}
					else {
						return false;
					}
				},
*/

				cargarPersona : function() {
					var self = this;
					if (self.rut.isValid())
						$.get("rest/persona/" + self.usuario().rut()/*+"/"+ self.usuario().dv()*/ + "?ts="
								+ new Date().getTime(), function(data) {
							//if (data.id && self.usuario().id() !== data.id) {
								self.usuario().clean();
								if (data){
									self.usuario().loadData(data);
									if (self.usuario().comuna()){
										$.each(self.comunas(),
												function(key, value) {
											if (value.id === self.usuario().comuna().id) {
												self.usuario().comuna(value);
												return false;
											}
										});
									}
								}
							//}
						});
				},
				cargarUsuario : function() {
					var self = this;
					if (self.rut.isValid())
						$.get("rest/usuario/" + self.usuario().rut() + "/" + this.codInstitucion +"?ts="
								+ new Date().getTime(), function(data) {
							if (data){
								if (data.habilitado && data.roles && data.roles.length > 0) {
									self.hideModalForm();
									self.showModalError();
								} else {
									self.usuario().idUsuario(data.idUsuario);
									self.usuario().usuario(data.usuario);
									self.usuario().password(data.password);
									self.usuario().roles(data.roles);
								}
							}
						});
				},
				eliminarUsuario : function() {
					var self = this;
					$.post("rest/usuario/delete/" + self.usuario().idUsuario() + "/" + this.codInstitucion)
							.done(function() {
								self.loadUsuarios();
								self.showModalDeleteSuccess();
							}).fail(function() {
								alert("error");
							});
				},

				validarEliminarUsuario : function() {
					var self = this;
					$.ajax({
						url : "rest/usuario/containSolicitud/" + self.usuario().idUsuario() + "/" + this.codInstitucion +"?ts="
						+ new Date().getTime(),
						//data : data,
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						type : 'post',
						success: function (result) {
							if(result){
								toastr.error("El usuario cuenta con escritos o demandas asignadas");
							}else{
								$('#modalEliminar').modal('show');
							}
				        },
				        async: false
					}).fail(function() {
						self.hideModalForm();
						self.showModalUpdateError();
					});
					/*$.post("rest/usuario/containSolicitud/" + self.usuario().idUsuario() + "/" + this.codInstitucion +"?ts="
							+ new Date().getTime(), function(data) {
						if (data){
							//alert('entrooo' + data);
							return data;
						}
					});*/
				},

				actualizarUsuario : function() {
					var self = this, data = self.usuario().toJSON(true);
					$.ajax({
						url : "rest/usuario/update/" + this.codInstitucion,
						data : data,
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						type : 'post'
					}).done(function() {
						self.loadUsuarios();
						self.hideModalForm();
						self.showModalUpdateSuccess();
					}).fail(function() {
						self.hideModalForm();
						self.showModalUpdateError();
					});

				},
				guardarUsuario : function() {
					//this.institucion().idInstitucion(User.idInstitucion());
					//this.institucion().nombreInstitucion(User.nombreInstitucion());
					this.institucion().idInstitucion(User.roles()[0].idInstitucion);
					this.institucion().idInstitucion(User.roles()[0].idInstitucion);
					this.usuario().institucion(this.institucion());
					this.usuario().save();
				},
				seleccionar : function(usuario, clean) {

					if (clean)
						this.usuario().clean();
					this.usuario().loadData(usuario.toJSON());
					var self = this;
					if (usuario.comuna() && usuario.comuna().id) {
						$.each(self.comunas(), function(key, value) {
							if (value.id === usuario.comuna().id) {
								self.usuario().comuna(value);
								return false;
							}
						});
					}
					if (usuario.rol() && usuario.rol().id) {
						$.each(self.roles(), function(key, value) {
							if (value.id === usuario.rol().id) {
								self.usuario().rol(value);
								return false;
							}
						});
					}
				},
				changeRut : function() {
					var self = this;
					if (self.rut.isValid()) {
						self.usuario().rutCompleto(self.rut());
						self.cargarUsuario();
						self.cargarPersona();
					} else {
						self.usuario().clean();
					}
				},
				limpiarForm : function() {
					this.rut('');
					this.usuario().nombres(null);
					this.usuario().direccion(null);
					this.usuario().comuna(null);
					this.usuario().email(null);
					this.usuario().apellidoPaterno(null);
					this.usuario().apellidoMaterno(null);
					this.usuario().profesion(null);
					this.usuario().telefono(null);
					this.usuario().rol({});
				},
				showModalEliminar : function() {
					this.validarEliminarUsuario();
					//$('#modalEliminar').modal('show');
				},
				DEBUG : function() {
					console.info("DEBUG");
				},
                 Validationpassword2 : function() {


                    console.info('ok');
				},

                configToastr: function () {
                        toastr.options = {
                            "closeButton": false,
                            "debug": false,
                            "newestOnTop": false,
                            "progressBar": false,
                            "positionClass": "toast-top-right",
                            "preventDuplicates": false,
                            "onclick": null,
                            "showDuration": "900",
                            "hideDuration": "500",
                            "timeOut": "3200",
                            "extendedTimeOut": "1000",
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        }
                    }
			});

			return {
				viewModel : MantenedorUsuariosViewModel,
				template : templateMarkup

			};


		});
